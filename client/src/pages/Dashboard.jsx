import { useSelector } from "react-redux";

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
        </header>

        <main>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
              <div className="mt-4 space-y-4">
                <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                  Create New Schedule
                </button>
                <button className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  View Templates
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">Overview</h2>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Schedules
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    0
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Active Templates
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-indigo-600">
                    0
                  </dd>
                </div>
              </dl>
            </div>

            {/* Recent Activity Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h2>
              <div className="mt-4">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
