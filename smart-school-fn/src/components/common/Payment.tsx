import React, { useEffect, useState } from 'react';
import { CreditCard, Clock, Book, ArrowLeft, ArrowRight, Loader2, CheckCircle, XCircle } from 'lucide-react';
import mtn from "../../assets/momopay.jpg";
import airtel from "../../assets/airtel.png";
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { breakdownDays } from '../../utils/convertDays';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/stores';
import { fetchCourses } from '../../redux/features/courses/courseSlice';
import socket from '../../utils/socket';
import api from '../../redux/api/api';

type PaymentMethod = 'mtn' | 'airtel' | '';
type ModalType = 'loading' | 'success' | 'failure' | '';

export const PaymentFlow: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
    const [phoneNumber, setPhoneNumber] = useState<string>('07');
    const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalType, setModalType] = useState<ModalType>('');
    const { amount, period } = useParams<{ amount: string, period: string }>();
    const [searchParams] = useSearchParams();
    const type = (searchParams.get("type") || "").trim().toLowerCase();
    const name = (searchParams.get("name") || "").trim();
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { items: courses, loading, error } = useSelector((state: RootState) => state.courses);

    const filterTuitionCourses = courses.filter((course: any) => {
        const categoryName = course.category.name.toLowerCase().replace(/\s+/g, "");
        const targetName = "cpa(r)".toLowerCase().replace(/\s+/g, "");
        return categoryName !== targetName;
    });

    const filterCpaCourses = courses.filter((course: any) => {
        const categoryName = course.category.name.toLowerCase().replace(/\s+/g, "");
        const targetName = "cpa(r)".toLowerCase().replace(/\s+/g, "");
        return categoryName === targetName;
    });
    const normalize = (str: string) =>
        str
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/\(r\)/g, "r")
            .trim();
    useEffect(() => {
        if (type !== "cpa") {
            setAvailableCourses(filterTuitionCourses);
        } else if (type === "cpa") {
            setAvailableCourses(filterCpaCourses);

            const match = filterCpaCourses.find(
                (course: any) => normalize(course.title) === normalize(name)
            );

            if (match) {
                setSelectedCourses([match]);
            }
        }
    }, [courses, type, name]);

    useEffect(() => {
        dispatch(fetchCourses({ page: 1, q: '', limit: 1000, categoryId: null }));
    }, [dispatch]);

    useEffect(() => {
        socket.on("transactionUpdate", (data) => {
            if (data.status === "COMPLETED") {
                setModalType("success");
                setShowModal(true);
            } else if (data.status === "FAILED") {
                setModalType("failure");
                setShowModal(true);
            }
        });
        return () => {
            socket.off("transactionUpdate");
        };
    }, []);

    const handleCourseSelection = (course: any): void => {
        if (type === "cpa") {
            return;
        }
        setSelectedCourses(prev => {
            if (prev.find(c => c.id === course.id)) {
                return prev.filter(c => c.id !== course.id);
            } else if (prev.length < 3) {
                return [...prev, course];
            }
            return prev;
        });
    };

    const handlePayment = async () => {
        setShowModal(true);
        setModalType('loading');

        const paymentData = {
            amount: parseInt(amount!),
            phoneNumber,
            channel: paymentMethod,
            subscriptionPeriod: parseInt(period!),
            subscribedCourseIds: selectedCourses.map(cs => cs.id),
        };

        try {
            const response = await api.post('/payments/cashin', paymentData);
            const paymentId = response.data.paymentId;
            socket.emit("joinTransaction", { transactionId: paymentId });
        } catch (error: any) {
            setModalType('failure');
        }
    };

    const closeModal = (): void => {
        setShowModal(false);
        if (modalType === 'success') {
            navigate('/courses');
            setStep(1);
            setPaymentMethod('');
            setPhoneNumber('07');
            setSelectedCourses([]);
        }
    };

    const handlePaymentMethodSelect = (method: PaymentMethod): void => {
        setPaymentMethod(method);
    };

    const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setPhoneNumber(event.target.value);
    };

    const totalAmount = amount;
    const isFormValid: boolean =
        paymentMethod !== '' &&
        phoneNumber.length >= 10 &&
        selectedCourses.length > 0;
    const { years, months, weeks, days } = breakdownDays(Number(period));

    // Main Payment Form
    if (step === 1) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Complete Your Subscription</h2>
                    <div className="bg-blue-50 p-4 rounded-lg inline-block">
                        <p className="text-xl font-semibold text-blue-800">{amount?.toLocaleString()} RWF</p>
                        <p className="text-sm text-blue-600 flex items-center justify-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {years} years, {months} months, {weeks} weeks, {days} days subscription
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Payment Method */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h3>
                            <div className="space-y-3">
                                <div
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'mtn'
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-gray-200 hover:border-yellow-300'
                                        }`}
                                    onClick={() => handlePaymentMethodSelect('mtn')}
                                >
                                    <div className="flex items-center">
                                        <img src={mtn} alt="MTN Mobile Money" className="w-12 h-12 mr-3 rounded-md" />
                                        <div>
                                            <p className="font-semibold text-gray-800">MTN Mobile Money</p>
                                            <p className="text-sm text-gray-600">Pay with MTN MoMo</p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${paymentMethod === 'airtel'
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-red-300'
                                        }`}
                                    onClick={() => handlePaymentMethodSelect('airtel')}
                                >
                                    <div className="flex items-center">
                                        <img src={airtel} alt="Airtel Money" className="w-12 h-12 mr-3 rounded-md" />
                                        <div>
                                            <p className="font-semibold text-gray-800">Airtel Money</p>
                                            <p className="text-sm text-gray-600">Pay with Airtel Money</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Phone Number</h3>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={handlePhoneNumberChange}
                                    disabled={!paymentMethod}
                                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!paymentMethod ? 'bg-gray-100 cursor-not-allowed' : ''
                                        }`}
                                    placeholder="0781234567"
                                />
                                {paymentMethod && (
                                    <div className="absolute right-3 top-3">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full ${paymentMethod === 'mtn'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {paymentMethod.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Course Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800">Choose Your Courses</h3>
                            <span className="text-sm text-gray-600">({selectedCourses.length}{type !== "cpa" && "/3"} selected)</span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-96">
                                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center h-96">
                                <p className="text-red-600">{error}</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {availableCourses.map((course: any) => {
                                    const isSelected = !!selectedCourses.find(c => c.id === course.id);
                                    const canSelect =
                                        type === "cpa"
                                            ? isSelected // only preselected course clickable
                                            : selectedCourses.length < 3 || isSelected;

                                    return (
                                        <div
                                            key={course.id}
                                            className={`border-2 rounded-lg p-4 transition-all ${isSelected
                                                ? 'border-green-500 bg-green-50'
                                                : canSelect
                                                    ? 'border-gray-200 hover:border-blue-300 cursor-pointer'
                                                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                }`}
                                            onClick={() => canSelect && handleCourseSelection(course)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center mb-2">
                                                        <Book className="w-5 h-5 text-blue-600 mr-2" />
                                                        <h4 className="font-semibold text-gray-800 text-sm">{course.title}</h4>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">{course.shortDescription}</p>
                                                    <p className="text-xs text-green-600 font-medium">
                                                        {course.enrollments?.length > 0 ? 'Enrolled' : 'Not Enrolled'}
                                                    </p>
                                                </div>
                                                {isSelected && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm text-gray-600">Subscription Total</p>
                            <p className="text-2xl font-bold text-blue-600">{totalAmount?.toLocaleString()} RWF</p>
                            <p className="text-xs text-gray-500">for {period} access</p>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!isFormValid}
                            className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center"
                        >
                            Review & Pay
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Preview and Confirmation Page
    if (step === 2) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Preview</h2>
                    <p className="text-gray-600">Review your information</p>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span className="font-semibold">{paymentMethod.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phone Number:</span>
                                <span className="font-semibold">{phoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Period:</span>
                                <span className="font-semibold">{years} years, {months} months, {weeks} weeks, {days} days</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-3">Subscription Courses ({selectedCourses.length} selected)</h3>
                        <ul className="space-y-2 text-sm">
                            {selectedCourses.map((course: any) => (
                                <li key={course.id} className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <span className="font-medium text-gray-800">{course.title}</span>
                                        <p className="text-xs text-gray-600">{course.shortDescription}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-center">
                            <span className="text-lg font-bold text-blue-800">Subscription Amount</span>
                            <div className="text-2xl font-bold text-blue-800 mt-1">{totalAmount?.toLocaleString()} RWF</div>
                            <p className="text-sm text-blue-600 mt-1">for {years} years, {months} months, {weeks} weeks, {days} days access to {selectedCourses.length} courses</p>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <button
                        onClick={handlePayment}
                        className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay Now
                    </button>
                </div>
                {/* Main content is hidden when modal is shown */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                            {modalType === 'loading' && (
                                <div className="text-center">
                                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
                                    <p className="text-gray-600">Please wait while we confirm your payment...</p>
                                    <p className="text-gray-600 text-center font-bold">*182*7*1#</p>
                                    <p className="text-gray-600 text-center"> or other options based on your phone operator</p>
                                </div>
                            )}

                            {modalType === 'success' && (
                                <div className="text-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                                    <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
                                    <p className="text-gray-600 text-center font-bold">You will receive a confirmation message with invoice details on your email</p>
                                    <button
                                        onClick={closeModal}
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            )}

                            {modalType === 'failure' && (
                                <div className="text-center">
                                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
                                    <p className="text-gray-600 mb-4">There was an issue processing your payment. Please try again.</p>
                                    <button
                                        onClick={closeModal}
                                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
};

