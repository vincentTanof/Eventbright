export default function RequestPending() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md border border-gray-300 text-center">
          <h1 className="text-2xl font-bold mb-4">Request Pending</h1>
          <p>Your request to become an Event Organizer is waiting for admin approval.</p>
        </div>
      </div>
    );
  }
  