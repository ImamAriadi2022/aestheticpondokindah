<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Shared\Reservation\ReservationChangesController;
use App\Http\Controllers\Api\Shared\Notification\WebPushSubscriptionController;

// =========================================================================
// 1. SHARED CONTROLLERS (Multi-Actor Interaction)
// =========================================================================
use App\Http\Controllers\Api\Shared\Auth\AuthController;
use App\Http\Controllers\Api\Shared\Auth\RegistrationController;
use App\Http\Controllers\Api\Shared\User\UserController;
use App\Http\Controllers\Api\Shared\Branch\BranchController;
use App\Http\Controllers\Api\Shared\Wilayah\WilayahController;
use App\Http\Controllers\Api\Shared\Media\UploadController;

// =========================================================================
// 2. ADMIN CONTROLLERS (Clinic Management & Content)
// =========================================================================
use App\Http\Controllers\Api\Admin\Analytics\AnalyticsAdminController;
use App\Http\Controllers\Api\Admin\Settings\ClinicSettingAdminController;
use App\Http\Controllers\Api\Admin\DownloadApp\DownloadAppAdminController;
use App\Http\Controllers\Api\Admin\PromoClaim\PromoClaimController;
use App\Http\Controllers\Api\Admin\Reservation\ReservationAdminController;
use App\Http\Controllers\Api\Admin\Consultation\ConsultationAdminController;
use App\Http\Controllers\Api\Admin\Complaint\ComplaintAdminController;
use App\Http\Controllers\Api\Admin\Membership\MembershipAdminController;
use App\Http\Controllers\Api\Admin\PublicInfo\ClinicServiceAdminController;
use App\Http\Controllers\Api\Admin\PublicInfo\FaqAdminController;
use App\Http\Controllers\Api\Admin\PublicInfo\ContactMessageAdminController;
use App\Http\Controllers\Api\Admin\PublicInfo\AboutAdminController;
use App\Http\Controllers\Api\Admin\PublicInfo\LegalAdminController;
use App\Http\Controllers\Api\Admin\Content\GalleryAdminController;
use App\Http\Controllers\Api\Admin\Content\MediaAdminController;
use App\Http\Controllers\Api\Admin\Content\PopupAdminController;
use App\Http\Controllers\Api\Admin\Content\PostAdminController;
use App\Http\Controllers\Api\Admin\Content\PromoAdminController;
use App\Http\Controllers\Api\Admin\Content\TestimonialAdminController;

// =========================================================================
// 3. DOCTOR CONTROLLERS (Clinical Practice & EMR)
// =========================================================================
use App\Http\Controllers\Api\Doctor\Schedule\DoctorScheduleController;
use App\Http\Controllers\Api\Doctor\Consultation\DoctorConsultationController;
use App\Http\Controllers\Api\Doctor\Consultation\ConsultationMessageController;
use App\Http\Controllers\Api\Doctor\Consultation\ConsultationMeetingController;
use App\Http\Controllers\Api\Doctor\Queue\DoctorQueueController;
use App\Http\Controllers\Api\Doctor\Visit\VisitController;
use App\Http\Controllers\Api\Doctor\MedicalRecord\MedicalRecordController;
use App\Http\Controllers\Api\Doctor\MedicalRecord\SoapController;
use App\Http\Controllers\Api\Doctor\Diagnosis\DiagnosisController;
use App\Http\Controllers\Api\Doctor\Procedure\ProcedureController;
use App\Http\Controllers\Api\Doctor\Odontogram\OdontogramController;

// =========================================================================
// 4. PATIENT CONTROLLERS (Patient Account, Membership & Finance)
// =========================================================================
use App\Http\Controllers\Api\Patient\Membership\MembershipController as UserMembershipController;
use App\Http\Controllers\Api\Patient\Membership\MembershipPaymentController as UserMembershipPaymentController;
use App\Http\Controllers\Api\Patient\Billing\PaymentController as UserPaymentController;
use App\Http\Controllers\Api\Patient\Complaint\ComplaintController as UserComplaintController;
use App\Http\Controllers\Api\Patient\Notification\NotificationController as UserNotificationController;
use App\Http\Controllers\Api\Patient\Reservation\ReservationController as UserReservationController;
use App\Http\Controllers\Api\Patient\Consultation\ConsultationController as UserConsultationController;

// =========================================================================
// 5. GUEST CONTROLLERS (Public Facing Information & Services)
// =========================================================================
use App\Http\Controllers\Api\Guest\Service\ClinicServicePublicController;
use App\Http\Controllers\Api\Guest\Faq\FaqPublicController;
use App\Http\Controllers\Api\Guest\Contact\ContactPublicController;
use App\Http\Controllers\Api\Guest\Content\ContentController;
use App\Http\Controllers\Api\Guest\Reservation\ReservationController as PublicReservationController;
use App\Http\Controllers\Api\Guest\Consultation\GuestConsultationController;
use App\Http\Controllers\Api\Guest\Analytics\AnalyticsVisitController;
use App\Http\Controllers\Api\Guest\Settings\ClinicSettingPublicController;
use App\Http\Controllers\Api\Guest\About\AboutPublicController;
use App\Http\Controllers\Api\Guest\Legal\LegalPublicController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =========================================================================
// 1. COMMON / SHARED UTILITY ROUTES
// =========================================================================
Route::get('/wilayah/provinsi', [WilayahController::class, 'provinces']);
Route::get('/wilayah/kabupaten/{provinceId}', [WilayahController::class, 'regencies']);
Route::get('/wilayah/kecamatan/{regencyId}', [WilayahController::class, 'districts']);
Route::get('/wilayah/kelurahan/{districtId}', [WilayahController::class, 'villages']);

// =========================================================================
// 2. AUTHENTICATION ROUTES (SHARED ACROSS ALL ACTORS)
// =========================================================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [RegistrationController::class, 'register']);
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
    Route::middleware('auth:sanctum')->post('/refresh', [AuthController::class, 'refresh']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
    Route::middleware('auth:sanctum')->post('/logout-all', [AuthController::class, 'logoutAll']);
});

// =========================================================================
// 3. ADMIN CLINIC ROUTES
// =========================================================================
Route::prefix('admin')->group(function () {
    Route::middleware(['auth:sanctum', 'role:clinic_admin'])->group(function () {
        // Analytics
        Route::get('/analytics/summary', [AnalyticsAdminController::class, 'summary']);

        // User / Patient Management
        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Doctor Management
        Route::get('/doctors', [UserController::class, 'doctors']);
        Route::get('/specializations', [UserController::class, 'specializations']);
        Route::get('/doctors/{user}', [UserController::class, 'show']);
        Route::post('/doctors', [UserController::class, 'storeDoctor']);
        Route::put('/doctors/{user}', [UserController::class, 'update']);
        Route::delete('/doctors/{user}', [UserController::class, 'destroy']);
        Route::post('/doctors/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Doctor Schedules (Admin)
        Route::get('/doctor-schedules', [DoctorScheduleController::class, 'adminIndex']);
        Route::post('/doctor-schedules', [DoctorScheduleController::class, 'adminStore']);
        Route::delete('/doctor-schedules/{schedule}', [DoctorScheduleController::class, 'adminDestroy']);

        // Branches (Admin)
        Route::get('/branches', [BranchController::class, 'adminIndex']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);

        // Reservations (Admin)
        Route::get('/reservations', [ReservationAdminController::class, 'index']);
        Route::put('/reservations/{reservation}', [ReservationAdminController::class, 'update']);

        // Clinic Settings (T&C, WA number, etc.)
        Route::get('/clinic-settings', [ClinicSettingAdminController::class, 'index']);
        Route::post('/clinic-settings/batch', [ClinicSettingAdminController::class, 'saveBatch']);
        Route::get('/clinic-settings/{key}', [ClinicSettingAdminController::class, 'show']);
        Route::put('/clinic-settings/{key}', [ClinicSettingAdminController::class, 'update']);

        // Content Management
        Route::get('/posts', [PostAdminController::class, 'index']);
        Route::post('/posts', [PostAdminController::class, 'store']);
        Route::post('/posts/{post}', [PostAdminController::class, 'update']);
        Route::delete('/posts/{post}', [PostAdminController::class, 'destroy']);

        Route::get('/popups', [PopupAdminController::class, 'index']);
        Route::post('/popups', [PopupAdminController::class, 'store']);
        Route::post('/popups/{popup}', [PopupAdminController::class, 'update']);
        Route::put('/popups/{popup}', [PopupAdminController::class, 'update']);
        Route::delete('/popups/{popup}', [PopupAdminController::class, 'destroy']);

        Route::get('/gallery-items', [GalleryAdminController::class, 'index']);
        Route::post('/gallery-items', [GalleryAdminController::class, 'store']);
        Route::post('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'update']);
        Route::put('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'update']);
        Route::delete('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'destroy']);

        Route::get('/testimonials', [TestimonialAdminController::class, 'index']);
        Route::post('/testimonials', [TestimonialAdminController::class, 'store']);
        Route::post('/testimonials/{testimonial}', [TestimonialAdminController::class, 'update']);
        Route::put('/testimonials/{testimonial}', [TestimonialAdminController::class, 'update']);
        Route::delete('/testimonials/{testimonial}', [TestimonialAdminController::class, 'destroy']);

        Route::get('/promos', [PromoAdminController::class, 'index']);
        Route::post('/promos', [PromoAdminController::class, 'store']);
        Route::post('/promos/{promo}', [PromoAdminController::class, 'update']);
        Route::put('/promos/{promo}', [PromoAdminController::class, 'update']);
        Route::delete('/promos/{promo}', [PromoAdminController::class, 'destroy']);

        Route::get('/media', [MediaAdminController::class, 'index']);
        Route::post('/media', [MediaAdminController::class, 'store']);
        Route::delete('/media/{media}', [MediaAdminController::class, 'destroy']);

        // Consultations (Admin)
        Route::get('/consultations', [ConsultationAdminController::class, 'index']);
        Route::get('/consultations/queue', [ConsultationAdminController::class, 'queue']);
        Route::get('/doctors-availability', [ConsultationAdminController::class, 'doctorsAvailability']);
        Route::post('/consultations/{consultation}/accept', [ConsultationAdminController::class, 'accept']);
        Route::post('/consultations/{consultation}/reject', [ConsultationAdminController::class, 'reject']);
        Route::post('/consultations/{consultation}/transfer', [ConsultationAdminController::class, 'transfer']);
        Route::post('/consultations/{consultation}/close', [ConsultationAdminController::class, 'close']);
        Route::post('/consultations/{consultation}/messages', [ConsultationAdminController::class, 'sendMessage']);
        Route::post('/consultations/{consultation}/read', [ConsultationAdminController::class, 'markRead']);
        Route::get('/consultations/{consultation}', [ConsultationAdminController::class, 'show']);
        Route::put('/consultations/{consultation}', [ConsultationAdminController::class, 'update']);

        // Complaints (Admin)
        Route::get('/complaints', [ComplaintAdminController::class, 'index']);
        Route::put('/complaints/{complaint}', [ComplaintAdminController::class, 'update']);
        Route::delete('/complaints/{complaint}', [ComplaintAdminController::class, 'destroy']);

        // Promo Claims (Admin)
        Route::get('/users/search', [PromoClaimController::class, 'search']);
        Route::get('/users/{user}/promo-eligibility', [PromoClaimController::class, 'eligibility']);
        Route::post('/users/{user}/claim-promo', [PromoClaimController::class, 'store']);
        Route::get('/users/{user}/promo-claims', [PromoClaimController::class, 'index']);

        // Membership (Admin)
        Route::prefix('membership')->group(function () {
            Route::get('/', [MembershipAdminController::class, 'index']);
            Route::get('/upgrade-requests', [MembershipAdminController::class, 'requests']);
            Route::get('/upgrade-requests/{id}', [MembershipAdminController::class, 'showRequest']);
            Route::post('/upgrade-requests/{id}/approve', [MembershipAdminController::class, 'approveRequest']);
            Route::post('/upgrade-requests/{id}/confirm-payment', [MembershipAdminController::class, 'confirmManualPayment']);
            Route::post('/upgrade-requests/{id}/reject', [MembershipAdminController::class, 'rejectRequest']);
            Route::get('/invoices', [MembershipAdminController::class, 'invoices']);
            Route::get('/invoices/{id}', [MembershipAdminController::class, 'showInvoice']);
            Route::get('/{id}', [MembershipAdminController::class, 'show']);
            Route::get('/{id}/points-history', [MembershipAdminController::class, 'pointsHistory']);
            Route::patch('/{id}/level', [MembershipAdminController::class, 'updateLevel']);
            Route::patch('/{id}/points', [MembershipAdminController::class, 'updatePoints']);
            Route::delete('/{id}', [MembershipAdminController::class, 'destroy']);
            Route::get('/analytics', [MembershipAdminController::class, 'analytics']);
            Route::get('/level-distribution', [MembershipAdminController::class, 'levelDistribution']);
        });

        // Download Apps (Admin)
        Route::get('/download-apps', [DownloadAppAdminController::class, 'index']);
        Route::post('/download-apps', [DownloadAppAdminController::class, 'store']);
        Route::post('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'update']);
        Route::put('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'update']);
        Route::delete('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'destroy']);

        // Informasi & Layanan Publik (Admin)
        Route::get('/services', [ClinicServiceAdminController::class, 'index']);
        Route::post('/services', [ClinicServiceAdminController::class, 'store']);
        Route::get('/services/{service}', [ClinicServiceAdminController::class, 'show']);
        Route::put('/services/{service}', [ClinicServiceAdminController::class, 'update']);
        Route::delete('/services/{service}', [ClinicServiceAdminController::class, 'destroy']);

        Route::get('/faqs', [FaqAdminController::class, 'index']);
        Route::post('/faqs', [FaqAdminController::class, 'store']);
        Route::get('/faqs/{faq}', [FaqAdminController::class, 'show']);
        Route::put('/faqs/{faq}', [FaqAdminController::class, 'update']);
        Route::delete('/faqs/{faq}', [FaqAdminController::class, 'destroy']);

        Route::get('/contact-messages', [ContactMessageAdminController::class, 'index']);
        Route::get('/contact-messages/{contactMessage}', [ContactMessageAdminController::class, 'show']);
        Route::put('/contact-messages/{contactMessage}', [ContactMessageAdminController::class, 'update']);
        Route::delete('/contact-messages/{contactMessage}', [ContactMessageAdminController::class, 'destroy']);

        Route::get('/about', [AboutAdminController::class, 'show']);
        Route::put('/about', [AboutAdminController::class, 'update']);

        Route::get('/legal/{type}', [LegalAdminController::class, 'show']);
        Route::put('/legal/{type}', [LegalAdminController::class, 'update']);
    });
});

// =========================================================================
// 4. PATIENT / USER AUTHENTICATED ROUTES
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reservations/changes', [ReservationChangesController::class, 'changes']);
    Route::post('/upload', [UploadController::class, 'store']);

    // Profile (Shared User entity)
    Route::get('/user/profile', [UserController::class, 'showProfile']);
    Route::match(['PUT', 'POST'], '/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/password', [UserController::class, 'updatePassword']);
    Route::put('/user/email', [UserController::class, 'updateEmail']);
    Route::put('/user/preferences', [UserController::class, 'updatePreferences']);
    Route::delete('/user/account', [UserController::class, 'deleteAccount']);

    // Consultations (Patient)
    Route::get('/user/consultations', [UserConsultationController::class, 'index']);
    Route::post('/user/consultations', [UserConsultationController::class, 'store']);
    Route::get('/user/consultations/{id}', [UserConsultationController::class, 'show']);
    Route::post('/user/consultations/{id}/messages', [UserConsultationController::class, 'sendMessage']);
    Route::post('/user/consultations/{id}/read', [UserConsultationController::class, 'markRead']);
    Route::get('/user/consultations/{id}/meetings', [UserConsultationController::class, 'meetings']);

    // Reservations (Patient)
    Route::get('/user/reservations', [UserReservationController::class, 'index']);
    Route::post('/user/reservations', [UserReservationController::class, 'store']);
    Route::get('/user/reservations/{id}', [UserReservationController::class, 'show']);
    Route::put('/user/reservations/{id}/cancel', [UserReservationController::class, 'cancel']);

    // Complaints (Patient)
    Route::get('/user/complaints', [UserComplaintController::class, 'index']);
    Route::post('/user/complaints', [UserComplaintController::class, 'store']);
    Route::get('/user/complaints/{complaint}', [UserComplaintController::class, 'show']);

    // Patient Visits
    Route::get('/user/visits', [VisitController::class, 'patientIndex']);
    Route::get('/user/visits/{id}', [VisitController::class, 'patientShow']);

    // Patient Medical Records
    Route::get('/user/medical-records', [MedicalRecordController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}', [MedicalRecordController::class, 'patientShow']);
    Route::get('/user/medical-records/{id}/soap', [SoapController::class, 'patientShow']);
    Route::get('/user/medical-records/{id}/diagnoses', [DiagnosisController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}/procedures', [ProcedureController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}/odontogram', [OdontogramController::class, 'patientShow']);
    Route::get('/icd10', [DiagnosisController::class, 'searchIcd10']);
    Route::get('/procedure-catalog', [ProcedureController::class, 'searchCatalog']);

    // Payments & Invoices
    Route::get('/user/payments', [UserPaymentController::class, 'index']);
    Route::post('/user/invoices/{id}/payment', [UserPaymentController::class, 'createPayment']);
    Route::get('/user/payments/{id}', [UserPaymentController::class, 'show']);

    // Notifications
    Route::get('/user/notifications', [UserNotificationController::class, 'index']);
    Route::get('/user/notifications/unread-count', [UserNotificationController::class, 'unreadCount']);
    Route::post('/user/notifications/{id}/read', [UserNotificationController::class, 'markAsRead']);
    Route::post('/user/notifications/read-all', [UserNotificationController::class, 'markAllAsRead']);
    Route::delete('/user/notifications/{id}', [UserNotificationController::class, 'destroy']);
    Route::delete('/user/notifications', [UserNotificationController::class, 'clearAll']);
    Route::post('/user/device-token', [UserNotificationController::class, 'storeDeviceToken']);
    Route::delete('/user/device-token', [UserNotificationController::class, 'deleteDeviceToken']);

    // Membership (User)
    Route::prefix('membership')->group(function () {
        Route::get('/', [UserMembershipController::class, 'index']);
        Route::get('/tiers', [UserMembershipController::class, 'tiers']);
        Route::get('/profile', [UserMembershipController::class, 'getProfile']);
        Route::post('/profile', [UserMembershipController::class, 'updateProfile']);
        Route::get('/points', [UserMembershipController::class, 'getPoints']);
        Route::get('/history', [UserMembershipController::class, 'getHistory']);
        Route::get('/transactions', [UserMembershipController::class, 'getTransactions']);
        Route::post('/upgrade', [UserMembershipController::class, 'upgrade']);
        Route::post('/request-upgrade', [UserMembershipController::class, 'requestUpgrade']);
        Route::post('/renew', [UserMembershipController::class, 'renew']);
        Route::post('/cancel', [UserMembershipController::class, 'cancel']);
        Route::post('/redeem-points', [UserMembershipController::class, 'redeemPoints']);
        Route::post('/points/redeem', [UserMembershipController::class, 'redeemPoints']);

        // Membership Payment
        Route::get('/payment/options', [UserMembershipPaymentController::class, 'getUpgradeOptions']);
        Route::post('/payment/create', [UserMembershipPaymentController::class, 'createPayment']);
        Route::get('/payment/status/{transactionId}', [UserMembershipPaymentController::class, 'checkStatus']);
    });

    // =========================================================================
    // 5. DOCTOR PRACTITIONER ROUTES
    // =========================================================================
    Route::middleware('role:doctor')->group(function () {
        // Schedules
        Route::get('/doctor/schedules', [DoctorScheduleController::class, 'index']);
        Route::post('/doctor/schedules', [DoctorScheduleController::class, 'store']);
        Route::get('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'show']);
        Route::put('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'update']);
        Route::delete('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'destroy']);

        // Consultations (Doctor)
        Route::get('/doctor/consultations', [DoctorConsultationController::class, 'index']);
        Route::get('/doctor/consultations/dashboard', [DoctorConsultationController::class, 'dashboard']);
        Route::get('/doctor/consultations/{id}', [DoctorConsultationController::class, 'show']);
        Route::post('/doctor/consultations/{id}/assign', [DoctorConsultationController::class, 'assign']);
        Route::post('/doctor/consultations/{id}/start', [DoctorConsultationController::class, 'start']);
        Route::post('/doctor/consultations/{id}/complete', [DoctorConsultationController::class, 'complete']);
        Route::put('/doctor/consultations/{id}/status', [DoctorConsultationController::class, 'updateStatus']);
        Route::get('/doctor/consultations/{id}/patient-summary', [DoctorConsultationController::class, 'patientSummary']);
        Route::get('/doctor/consultations/{id}/messages', [ConsultationMessageController::class, 'index']);
        Route::post('/doctor/consultations/{id}/messages', [ConsultationMessageController::class, 'store']);
        Route::post('/doctor/consultations/{id}/read', [ConsultationMessageController::class, 'markRead']);
        Route::get('/doctor/consultations/{id}/meetings', [ConsultationMeetingController::class, 'index']);
        Route::post('/doctor/consultations/{id}/meetings', [ConsultationMeetingController::class, 'store']);
        Route::put('/doctor/consultation-meetings/{id}', [ConsultationMeetingController::class, 'update']);
        Route::delete('/doctor/consultation-meetings/{id}', [ConsultationMeetingController::class, 'destroy']);

        // Doctor Queue
        Route::get('/doctor/queue', [DoctorQueueController::class, 'queue']);
        Route::get('/doctor/reservations/{id}', [DoctorQueueController::class, 'show']);
        Route::put('/doctor/reservations/{id}/start', [DoctorQueueController::class, 'start']);
        Route::put('/doctor/reservations/{id}/complete', [DoctorQueueController::class, 'complete']);

        // Visits (Doctor)
        Route::get('/doctor/visits', [VisitController::class, 'doctorIndex']);
        Route::get('/doctor/visits/{id}', [VisitController::class, 'doctorShow']);
        Route::put('/doctor/visits/{id}/status', [VisitController::class, 'updateStatus']);

        // Medical Records (EMR)
        Route::get('/doctor/medical-records', [MedicalRecordController::class, 'doctorIndex']);
        Route::get('/doctor/medical-records/{id}', [MedicalRecordController::class, 'doctorShow']);
        Route::put('/doctor/medical-records/{id}/status', [MedicalRecordController::class, 'updateStatus']);
        Route::post('/doctor/medical-records/{id}/finalize', [MedicalRecordController::class, 'finalize']);
        Route::post('/doctor/medical-records/{id}/lock', [MedicalRecordController::class, 'lock']);

        // SOAP Notes
        Route::get('/doctor/medical-records/{id}/soap', [SoapController::class, 'doctorShow']);
        Route::post('/doctor/medical-records/{id}/soap', [SoapController::class, 'storeOrUpdate']);

        // Diagnoses (ICD-10)
        Route::get('/doctor/medical-records/{id}/diagnoses', [DiagnosisController::class, 'doctorIndex']);
        Route::post('/doctor/medical-records/{id}/diagnoses', [DiagnosisController::class, 'store']);
        Route::put('/doctor/diagnoses/{id}', [DiagnosisController::class, 'update']);
        Route::delete('/doctor/diagnoses/{id}', [DiagnosisController::class, 'destroy']);

        // Procedures
        Route::get('/doctor/medical-records/{id}/procedures', [ProcedureController::class, 'doctorIndex']);
        Route::post('/doctor/medical-records/{id}/procedures', [ProcedureController::class, 'store']);
        Route::put('/doctor/procedures/{id}', [ProcedureController::class, 'update']);
        Route::delete('/doctor/procedures/{id}', [ProcedureController::class, 'destroy']);

        // Odontogram
        Route::get('/doctor/medical-records/{id}/odontogram', [OdontogramController::class, 'doctorShow']);
        Route::post('/doctor/medical-records/{id}/odontogram/tooth', [OdontogramController::class, 'updateTooth']);
        Route::post('/doctor/medical-records/{id}/odontogram/bulk', [OdontogramController::class, 'bulkUpdate']);
    });
});

// =========================================================================
// 6. PUBLIC & GUEST ACCESSIBLE ROUTES
// =========================================================================
Route::prefix('public')->group(function () {
    // Analytics
    Route::post('/analytics/visit', [AnalyticsVisitController::class, 'store']);

    // Guest Consultations
    Route::post('/consultations', [GuestConsultationController::class, 'store']);
    Route::get('/consultations/{token}', [GuestConsultationController::class, 'show']);
    Route::post('/consultations/{token}/messages', [GuestConsultationController::class, 'sendMessage']);
    Route::post('/consultations/{token}/read', [GuestConsultationController::class, 'markRead']);

    // Public Media & Content
    Route::get('/posts', [ContentController::class, 'posts']);
    Route::get('/posts/{slug}', [ContentController::class, 'postBySlug']);
    Route::get('/popup/active', [ContentController::class, 'activePopup']);
    Route::get('/gallery-items', [ContentController::class, 'gallery']);
    Route::get('/testimonials', [ContentController::class, 'testimonials']);
    Route::get('/promos', [ContentController::class, 'promos']);
    Route::get('/promos/{slug}', [ContentController::class, 'promoBySlug']);
    Route::get('/doctor-schedules', [DoctorScheduleController::class, 'publicIndex']);
    Route::get('/doctors', [UserController::class, 'publicDoctors']);
    Route::get('/specializations', [UserController::class, 'specializations']);
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/membership/tiers', [UserMembershipController::class, 'tiers']);
    Route::get('/download-apps', [ContentController::class, 'downloadApps']);
    Route::middleware('throttle:60,1')->post('/reservations', [PublicReservationController::class, 'store']);
    Route::get('/settings', [ClinicSettingPublicController::class, 'index']);

    // Informasi & Layanan Publik
    Route::get('/services', [ClinicServicePublicController::class, 'index']);
    Route::get('/services/{slug}', [ClinicServicePublicController::class, 'show']);
    Route::get('/faqs', [FaqPublicController::class, 'index']);
    Route::post('/contact', [ContactPublicController::class, 'store']);
    Route::get('/about', [AboutPublicController::class, 'show']);
    Route::get('/legal/{type}', [LegalPublicController::class, 'show']);
});

// Top-level Public Aliases (direct without /public prefix)
Route::get('/doctors', [UserController::class, 'publicDoctors']);
Route::get('/specializations', [UserController::class, 'specializations']);
Route::get('/services', [ClinicServicePublicController::class, 'index']);
Route::get('/branches', [BranchController::class, 'index']);

// =========================================================================
// 7. WEBHOOKS & EXTERNAL CALLBACKS
// =========================================================================
Route::post('/membership/payment/webhook', [UserMembershipPaymentController::class, 'webhook']);



Route::get('/guest/reservations/changes', [ReservationChangesController::class, 'changes']);


// Web Push VAPID Background Notifications (Multi-OS: Android, iOS, macOS, Windows)
Route::get('/push/vapid-public-key', [WebPushSubscriptionController::class, 'getVapidPublicKey']);
Route::post('/push/subscribe', [WebPushSubscriptionController::class, 'subscribe']);
Route::post('/push/unsubscribe', [WebPushSubscriptionController::class, 'unsubscribe']);
Route::post('/push/test', [WebPushSubscriptionController::class, 'testPush']);

