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
use App\Http\Controllers\Api\Admin\AnalyticsAdminController;
use App\Http\Controllers\Api\Admin\ReservationAdminController;
use App\Http\Controllers\Api\Admin\ConsultationAdminController;
use App\Http\Controllers\Api\Admin\MembershipAdminController;
use App\Http\Controllers\Api\Public\ContentController;
use App\Http\Controllers\Api\Public\ReservationController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\PromoClaimController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\DoctorConsultationController;
use App\Http\Controllers\Api\DoctorScheduleController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\User\MembershipController;
use App\Http\Controllers\Api\User\MembershipPaymentController;
use App\Http\Controllers\Api\User\NotificationController;
use App\Http\Controllers\Api\WilayahController;
use App\Http\Controllers\Api\Public\AnalyticsVisitController;
use Illuminate\Support\Facades\Route;

Route::get('/wilayah/provinsi', [WilayahController::class, 'provinces']);
Route::get('/wilayah/kabupaten/{provinceId}', [WilayahController::class, 'regencies']);
Route::get('/wilayah/kecamatan/{regencyId}', [WilayahController::class, 'districts']);

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

        Route::get('/reservations', [ReservationAdminController::class, 'index']);
        Route::put('/reservations/{reservation}', [ReservationAdminController::class, 'update']);

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
            Route::get('/{id}', [MembershipAdminController::class, 'show']);
            Route::patch('/{id}/level', [MembershipAdminController::class, 'updateLevel']);
            Route::patch('/{id}/points', [MembershipAdminController::class, 'updatePoints']);
            Route::delete('/{id}', [MembershipAdminController::class, 'destroy']);
            Route::get('/analytics', [MembershipAdminController::class, 'analytics']);
            Route::get('/level-distribution', [MembershipAdminController::class, 'levelDistribution']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/upload', [UploadController::class, 'store']);

    Route::get('/user/profile', [UserController::class, 'showProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::get('/user/consultations', [ConsultationController::class, 'index']);
    Route::post('/user/consultations', [ConsultationController::class, 'store']);
    Route::get('/user/complaints', [ComplaintController::class, 'index']);
    Route::post('/user/complaints', [ComplaintController::class, 'store']);
    Route::get('/user/complaints/{complaint}', [ComplaintController::class, 'show']);

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
        Route::post('/renew', [MembershipController::class, 'renew']);
        Route::post('/cancel', [MembershipController::class, 'cancel']);
        Route::post('/redeem-points', [MembershipController::class, 'redeemPoints']);
        Route::post('/points/redeem', [MembershipController::class, 'redeemPoints']);
        
        // Payment Routes
        Route::get('/payment/options', [MembershipPaymentController::class, 'getUpgradeOptions']);
        Route::post('/payment/create', [MembershipPaymentController::class, 'createPayment']);
        Route::get('/payment/status/{transactionId}', [MembershipPaymentController::class, 'checkStatus']);
        Route::get('/payment/simulate/{transactionId}', [MembershipPaymentController::class, 'simulatePayment']);
        Route::post('/payment/simulate/{transactionId}', [MembershipPaymentController::class, 'simulatePayment']);
    });

    Route::middleware('role:doctor')->group(function () {
        Route::get('/doctor/schedules', [DoctorScheduleController::class, 'index']);
        Route::post('/doctor/schedules', [DoctorScheduleController::class, 'store']);
        Route::get('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'show']);
        Route::put('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'update']);
        Route::delete('/doctor/schedules/{schedule}', [DoctorScheduleController::class, 'destroy']);

        Route::get('/doctor/consultations', [DoctorConsultationController::class, 'index']);
    });
});

Route::prefix('public')->group(function () {
    Route::post('/analytics/visit', [AnalyticsVisitController::class, 'store']);
    Route::get('/posts', [ContentController::class, 'posts']);
    Route::get('/posts/{slug}', [ContentController::class, 'postBySlug']);
    Route::get('/popup/active', [ContentController::class, 'activePopup']);
    Route::get('/gallery-items', [ContentController::class, 'gallery']);
    Route::get('/testimonials', [ContentController::class, 'testimonials']);
    Route::get('/promos', [ContentController::class, 'promos']);
    Route::get('/promos/{slug}', [ContentController::class, 'promoBySlug']);
    Route::get('/doctor-schedules', [DoctorScheduleController::class, 'publicIndex']);
    Route::middleware('throttle:5,1')->post('/reservations', [ReservationController::class, 'store']);
});
