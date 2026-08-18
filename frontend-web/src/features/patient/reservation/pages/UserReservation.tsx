import NewBookingFlow from "../components/NewBookingFlow";

export default function UserReservation() {
  return (
    <div className="space-y-6">
      <NewBookingFlow initialStep="layanan" />
    </div>
  );
}
