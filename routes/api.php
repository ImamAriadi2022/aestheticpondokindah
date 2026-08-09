<?php

use App\Http\Controllers\Api\Admin\ComplaintAdminController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\Content\GalleryAdminController;
use App\Http\Controllers\Api\Admin\Content\MediaAdminController;
use App\Http\Controllers\Api\Admin\Content\PopupAdminController;
use App\Http\Controllers\Api\Admin\Content\PostAdminController;
use App\Http\Controllers\Api\Admin\Content\PromoAdminController;
use App\Http\Controllers\Api\Admin\Content\TestimonialAdminController;
use App\Http\Controllers\Api\Admin\DownloadAppAdminController;
use App\Http\Controllers\Api\Admin\AnalyticsAdminController;
use App\Http\Controllers\Api\Admin\ReservationAdminController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\Admin\ConsultationAdminController;
use App\Http\Controllers\Api\Admin\MembershipAdminController;
use App\Http\Controllers\Api\Public\ContentController;
use App\Http\Controllers\Api\Public\ReservationController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\PromoClaimController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\GuestConsultationController;
use App\Http\Controllers\Api\ConsultationMessageController;
use App\Http\Controllers\Api\ConsultationMeetingController;
use App\Http\Controllers\Api\DoctorConsultationController;
use App\Http\Controllers\Api\Doctor\DoctorQueueController;
use App\Http\Controllers\Api\DoctorScheduleController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\User\MembershipController;
use App\Http\Controllers\Api\User\PaymentController;
use App\Http\Controllers\Api\VisitController;
use App\Http\Controllers\Api\MedicalRecordController;
use App\Http\Controllers\Api\SoapController;
use App\Http\Controllers\Api\DiagnosisController;
use App\Http\Controllers\Api\ProcedureController;
use App\Http\Controllers\Api\OdontogramController;
use App\Http\Controllers\Api\User\MembershipPaymentController;
use App\Http\Controllers\Api\User\NotificationController;
use App\Http\Controllers\Api\User\ReservationController as UserReservationController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\Public\AnalyticsVisitController;
use App\Http\Controllers\Api\Public\ClinicSettingPublicController;
use App\Http\Controllers\Api\Admin\ClinicSettingAdminController;
use Illuminate\Support\Facades\Route;

Route::get('/wilayah/provinsi', [WilayahController::class, 'provinces']);
Route::get('/wilayah/kabupaten/{provinceId}', [WilayahController::class, 'regencies']);
Route::get('/wilayah/kecamatan/{regencyId}', [WilayahController::class, 'districts']);
Route::get('/wilayah/kelurahan/{districtId}', [WilayahController::class, 'villages']);

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [RegistrationController::class, 'register']);
    Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

Route::prefix('admin')->group(function () {
    Route::middleware(['auth:sanctum', 'role:clinic_admin'])->group(function () {
        Route::get('/analytics/summary', [AnalyticsAdminController::class, 'summary']);
        Route::get('/users', [UserController::class, 'index']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        Route::get('/doctors', [UserController::class, 'doctors']);
        Route::get('/doctors/{user}', [UserController::class, 'show']);
        Route::post('/doctors', [UserController::class, 'storeDoctor']);
        Route::put('/doctors/{user}', [UserController::class, 'update']);
        Route::delete('/doctors/{user}', [UserController::class, 'destroy']);
        Route::post('/doctors/{user}/reset-password', [UserController::class, 'resetPassword']);

        Route::get('/doctor-schedules', [DoctorScheduleController::class, 'adminIndex']);

        Route::get('/branches', [BranchController::class, 'adminIndex']);
        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);

        Route::get('/reservations', [ReservationAdminController::class, 'index']);
        Route::put('/reservations/{reservation}', [ReservationAdminController::class, 'update']);

        // Clinic Settings (T&C, WA number, etc.)
        Route::get('/clinic-settings', [ClinicSettingAdminController::class, 'index']);
        Route::get('/clinic-settings/{key}', [ClinicSettingAdminController::class, 'show']);
        Route::put('/clinic-settings/{key}', [ClinicSettingAdminController::class, 'update']);

        Route::get('/posts', [PostAdminController::class, 'index']);
        Route::post('/posts', [PostAdminController::class, 'store']);
        Route::post('/posts/{post}', [PostAdminController::class, 'update']);
        Route::delete('/posts/{post}', [PostAdminController::class, 'destroy']);

        Route::get('/popups', [PopupAdminController::class, 'index']);
        Route::post('/popups', [PopupAdminController::class, 'store']);
        Route::post('/popups/{popup}', [PopupAdminController::class, 'update']);
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

        Route::get('/complaints', [ComplaintAdminController::class, 'index']);
        Route::put('/complaints/{complaint}', [ComplaintAdminController::class, 'update']);
        Route::delete('/complaints/{complaint}', [ComplaintAdminController::class, 'destroy']);

        Route::get('/users/search', [PromoClaimController::class, 'search']);
        Route::get('/users/{user}/promo-eligibility', [PromoClaimController::class, 'eligibility']);
        Route::post('/users/{user}/claim-promo', [PromoClaimController::class, 'store']);
        Route::get('/users/{user}/promo-claims', [PromoClaimController::class, 'index']);

        // Membership Admin Routes
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
            Route::patch('/{id}/level', [MembershipAdminController::class, 'updateLevel']);
            Route::patch('/{id}/points', [MembershipAdminController::class, 'updatePoints']);
            Route::delete('/{id}', [MembershipAdminController::class, 'destroy']);
            Route::get('/analytics', [MembershipAdminController::class, 'analytics']);
            Route::get('/level-distribution', [MembershipAdminController::class, 'levelDistribution']);
        });

        // Download App Admin Routes
        Route::get('/download-apps', [DownloadAppAdminController::class, 'index']);
        Route::post('/download-apps', [DownloadAppAdminController::class, 'store']);
        Route::post('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'update']);
        Route::put('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'update']);
        Route::delete('/download-apps/{downloadApp}', [DownloadAppAdminController::class, 'destroy']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/upload', [UploadController::class, 'store']);

    Route::get('/user/profile', [UserController::class, 'showProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/consultations', [ConsultationController::class, 'index']);
    Route::post('/user/consultations', [ConsultationController::class, 'store']);
    Route::get('/user/consultations/{id}', [ConsultationController::class, 'show']);
    Route::post('/user/consultations/{id}/messages', [ConsultationController::class, 'sendMessage']);
    Route::post('/user/consultations/{id}/read', [ConsultationController::class, 'markRead']);
    Route::get('/user/consultations/{id}/meetings', [ConsultationController::class, 'meetings']);
    Route::get('/user/reservations', [UserReservationController::class, 'index']);
    Route::post('/user/reservations', [UserReservationController::class, 'store']);
    Route::get('/user/reservations/{id}', [UserReservationController::class, 'show']);
    Route::put('/user/reservations/{id}/cancel', [UserReservationController::class, 'cancel']);
    Route::get('/user/complaints', [ComplaintController::class, 'index']);
    Route::post('/user/complaints', [ComplaintController::class, 'store']);
    Route::get('/user/complaints/{complaint}', [ComplaintController::class, 'show']);

    // Patient Visit Routes (Task 5.1)
    Route::get('/user/visits', [VisitController::class, 'patientIndex']);
    Route::get('/user/visits/{id}', [VisitController::class, 'patientShow']);

    // Patient Medical Record Routes (Task 5.2 & 5.3 & 5.4 & 5.5 & 5.6)
    Route::get('/user/medical-records', [MedicalRecordController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}', [MedicalRecordController::class, 'patientShow']);
    Route::get('/user/medical-records/{id}/soap', [SoapController::class, 'patientShow']);
    Route::get('/user/medical-records/{id}/diagnoses', [DiagnosisController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}/procedures', [ProcedureController::class, 'patientIndex']);
    Route::get('/user/medical-records/{id}/odontogram', [OdontogramController::class, 'patientShow']);
    Route::get('/icd10', [DiagnosisController::class, 'searchIcd10']);
    Route::get('/procedure-catalog', [ProcedureController::class, 'searchCatalog']);

    Route::get('/user/payments', [PaymentController::class, 'index']);
    Route::post('/user/invoices/{id}/payment', [PaymentController::class, 'createPayment']);
    Route::get('/user/payments/{id}', [PaymentController::class, 'show']);

    // Notification Routes
    Route::get('/user/notifications', [NotificationController::class, 'index']);
    Route::get('/user/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/user/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/user/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/user/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/user/notifications', [NotificationController::class, 'clearAll']);
    Route::post('/user/device-token', [NotificationController::class, 'storeDeviceToken']);
    Route::delete('/user/device-token', [NotificationController::class, 'deleteDeviceToken']);

    // Membership User Routes
    Route::prefix('membership')->group(function () {
        Route::get('/', [MembershipController::class, 'index']);
        Route::get('/tiers', [MembershipController::class, 'tiers']); // Public endpoint
        Route::get('/profile', [MembershipController::class, 'getProfile']);
        Route::post('/profile', [MembershipController::class, 'updateProfile']);
        Route::get('/points', [MembershipController::class, 'getPoints']);
        Route::get('/history', [MembershipController::class, 'getHistory']);
        Route::get('/transactions', [MembershipController::class, 'getTransactions']);
        Route::post('/upgrade', [MembershipController::class, 'upgrade']);
        Route::post('/request-upgrade', [MembershipController::class, 'requestUpgrade']);
        Route::post('/renew', [MembershipController::class, 'renew']);
        Route::post('/cancel', [MembershipController::class, 'cancel']);
        Route::post('/redeem-points', [MembershipController::class, 'redeemPoints']);
        Route::post('/points/redeem', [MembershipController::class, 'redeemPoints']);
        
        // Payment Routes
        Route::get('/payment/options', [MembershipPaymentController::class, 'getUpgradeOptions']);
        Route::post('/payment/create', [MembershipPaymentController::class, 'createPayment']);
        Route::get('/payment/status/{transactionId}', [MembershipPaymentController::class, 'checkStatus']);
    });

    Route::middleware('role:doctor')->group(function () {
        Route::get('/doctor/schedules', [DoctorScheduleController::class, 'index']);
        Route::post('/doctor/schedules', [DoctorScheduleController::class, 'store']);
        Route::get('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'show']);
        Route::put('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'update']);
        Route::delete('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'destroy']);
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

        Route::get('/doctor/queue', [DoctorQueueController::class, 'queue']);
        Route::get('/doctor/reservations/{id}', [DoctorQueueController::class, 'show']);
        Route::put('/doctor/reservations/{id}/start', [DoctorQueueController::class, 'start']);
        Route::put('/doctor/reservations/{id}/complete', [DoctorQueueController::class, 'complete']);

        // Doctor Visit Routes (Task 5.1)
        Route::get('/doctor/visits', [VisitController::class, 'doctorIndex']);
        Route::get('/doctor/visits/{id}', [VisitController::class, 'doctorShow']);
        Route::put('/doctor/visits/{id}/status', [VisitController::class, 'updateStatus']);

        // Doctor Medical Record Routes (Task 5.2)
        Route::get('/doctor/medical-records', [MedicalRecordController::class, 'doctorIndex']);
        Route::get('/doctor/medical-records/{id}', [MedicalRecordController::class, 'doctorShow']);
        Route::put('/doctor/medical-records/{id}/status', [MedicalRecordController::class, 'updateStatus']);
        Route::post('/doctor/medical-records/{id}/finalize', [MedicalRecordController::class, 'finalize']);
        Route::post('/doctor/medical-records/{id}/lock', [MedicalRecordController::class, 'lock']);

        // Structured SOAP Note Routes (Task 5.3)
        Route::get('/doctor/medical-records/{id}/soap', [SoapController::class, 'doctorShow']);
        Route::post('/doctor/medical-records/{id}/soap', [SoapController::class, 'storeOrUpdate']);

        // Clinical Diagnosis Routes (Task 5.4)
        Route::get('/doctor/medical-records/{id}/diagnoses', [DiagnosisController::class, 'doctorIndex']);
        Route::post('/doctor/medical-records/{id}/diagnoses', [DiagnosisController::class, 'store']);
        Route::put('/doctor/diagnoses/{id}', [DiagnosisController::class, 'update']);
        Route::delete('/doctor/diagnoses/{id}', [DiagnosisController::class, 'destroy']);

        // Clinical Procedure Routes (Task 5.5)
        Route::get('/doctor/medical-records/{id}/procedures', [ProcedureController::class, 'doctorIndex']);
        Route::post('/doctor/medical-records/{id}/procedures', [ProcedureController::class, 'store']);
        Route::put('/doctor/procedures/{id}', [ProcedureController::class, 'update']);
        Route::delete('/doctor/procedures/{id}', [ProcedureController::class, 'destroy']);

        // Electronic Odontogram Routes (Task 5.6)
        Route::get('/doctor/medical-records/{id}/odontogram', [OdontogramController::class, 'doctorShow']);
        Route::post('/doctor/medical-records/{id}/odontogram/tooth', [OdontogramController::class, 'updateTooth']);
        Route::post('/doctor/medical-records/{id}/odontogram/bulk', [OdontogramController::class, 'bulkUpdate']);
    });
});

Route::prefix('public')->group(function () {
    Route::post('/analytics/visit', [AnalyticsVisitController::class, 'store']);
    Route::post('/consultations', [GuestConsultationController::class, 'store']);
    Route::get('/consultations/{token}', [GuestConsultationController::class, 'show']);
    Route::post('/consultations/{token}/messages', [GuestConsultationController::class, 'sendMessage']);
    Route::post('/consultations/{token}/read', [GuestConsultationController::class, 'markRead']);
    Route::get('/posts', [ContentController::class, 'posts']);
    Route::get('/posts/{slug}', [ContentController::class, 'postBySlug']);
    Route::get('/popup/active', [ContentController::class, 'activePopup']);
    Route::get('/gallery-items', [ContentController::class, 'gallery']);
    Route::get('/testimonials', [ContentController::class, 'testimonials']);
    Route::get('/promos', [ContentController::class, 'promos']);
    Route::get('/promos/{slug}', [ContentController::class, 'promoBySlug']);
    Route::get('/doctor-schedules', [DoctorScheduleController::class, 'publicIndex']);
    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/membership/tiers', [MembershipController::class, 'tiers']);
    Route::get('/download-apps', [ContentController::class, 'downloadApps']);
    Route::middleware('throttle:60,1')->post('/reservations', [ReservationController::class, 'store']);
    Route::get('/settings', [ClinicSettingPublicController::class, 'index']);
});

// Midtrans sends this callback without an application session/token.
Route::post('/membership/payment/webhook', [MembershipPaymentController::class, 'webhook']);
