<?php

namespace Database\Seeders;

use App\Models\MembershipHistory;
use App\Models\MembershipPoint;
use App\Models\MembershipProfile;
use App\Models\MembershipTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class MembershipSeeder extends Seeder
{
    public function run(): void
    {
        // Get existing users
        $users = User::all();

        foreach ($users as $user) {
            // Assign random membership levels
            $levels = ['gold', 'platinum', 'diamond'];
            $level = $levels[array_rand($levels)];
            
            $user->update([
                'membership_level' => $level,
                'membership_status' => 'active',
                'membership_started_at' => now()->subMonths(rand(1, 12)),
                'membership_expires_at' => now()->addYear(),
                'membership_points' => rand(0, 5000),
                'total_transactions' => rand(0, 50000000),
                'completed_treatments' => rand(0, 20),
                'membership_profile_completed' => (bool) rand(0, 1),
            ]);

            // Create membership profile
            if ($user->membership_profile_completed) {
                MembershipProfile::create([
                    'user_id' => $user->id,
                    'gender' => ['male', 'female'][array_rand(['male', 'female'])],
                    'date_of_birth' => now()->subYears(rand(18, 65)),
                    'city' => ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'][array_rand(['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'])],
                    'dental_concerns' => ['teeth whitening', 'braces', 'dental implant', 'scaling'][array_rand(['teeth whitening', 'braces', 'dental implant', 'scaling'])],
                    'treatment_interests' => ['cosmetic dentistry', 'orthodontics', 'general dentistry'][array_rand(['cosmetic dentistry', 'orthodontics', 'general dentistry'])],
                    'dental_conditions' => ['sensitive teeth', 'gum disease', 'cavity'][array_rand(['sensitive teeth', 'gum disease', 'cavity'])],
                    'last_dental_visit' => now()->subMonths(rand(1, 6)),
                    'lifestyle_interests' => ['fitness', 'travel', 'reading'][array_rand(['fitness', 'travel', 'reading'])],
                    'personal_goals' => ['better smile', 'oral health', 'confidence'][array_rand(['better smile', 'oral health', 'confidence'])],
                    'communication_preferences' => ['email', 'whatsapp'][array_rand(['email', 'whatsapp'])],
                    'content_preferences' => ['promotions', 'tips', 'news'][array_rand(['promotions', 'tips', 'news'])],
                ]);
            }

            // Create membership transactions
            for ($i = 0; $i < rand(3, 10); $i++) {
                MembershipTransaction::create([
                    'user_id' => $user->id,
                    'amount' => rand(500000, 5000000),
                    'transaction_type' => ['treatment', 'upgrade', 'refund'][array_rand(['treatment', 'upgrade', 'refund'])],
                    'description' => 'Treatment payment',
                    'status' => 'completed',
                    'metadata' => ['treatment_type' => 'scaling'],
                ]);
            }

            // Create membership points
            for ($i = 0; $i < rand(5, 15); $i++) {
                MembershipPoint::create([
                    'user_id' => $user->id,
                    'points' => rand(10, 100),
                    'type' => ['earned', 'redeemed', 'expired'][array_rand(['earned', 'redeemed', 'expired'])],
                    'description' => 'Points from treatment',
                    'expires_at' => now()->addYear(),
                ]);
            }

            // Create membership history
            if ($level !== 'gold') {
                MembershipHistory::create([
                    'user_id' => $user->id,
                    'old_level' => 'gold',
                    'new_level' => $level,
                    'reason' => 'Automatic upgrade based on transactions',
                    'changed_by' => null,
                    'metadata' => ['upgrade_type' => 'automatic'],
                ]);
            }
        }

        $this->command->info('Membership data seeded successfully!');
    }
}
