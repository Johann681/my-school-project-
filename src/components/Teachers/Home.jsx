import { motion } from "framer-motion";

const Home = ({ teacherName = "Teacher" }) => {
  const displayName = teacherName || "Teacher";

  const stats = [
    { title: "Classes", value: "5", color: "bg-blue-100 text-blue-700" },
    { title: "Students", value: "120", color: "bg-green-100 text-green-700" },
    { title: "Exams", value: "8", color: "bg-yellow-100 text-yellow-700" },
    { title: "Assignments", value: "12", color: "bg-purple-100 text-purple-700" },
  ];

  const activities = [
    "Uploaded exam for Class 3B",
    "Reviewed assignments from Class 2A",
    "Held a meeting with parents",
    "Updated grades for Class 1C",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center gap-4 sm:gap-6 bg-white shadow rounded-xl p-4 sm:p-6"
        role="region"
        aria-label="Welcome"
      >
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt={`${displayName} avatar`}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-blue-500 object-cover flex-shrink-0"
        />
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
            Welcome back, {displayName}! <span aria-hidden>👋</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 truncate">
            Here’s an overview of your dashboard.
          </p>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        role="list"
        aria-label="Summary statistics"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className={`p-4 sm:p-6 rounded-xl shadow-md ${stat.color} min-h-[96px] flex flex-col justify-between`}
            role="listitem"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold truncate">{stat.title}</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-3">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="bg-white shadow rounded-xl p-4 sm:p-6"
        role="region"
        aria-label="Recent activity"
      >
        <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-800">Recent Activity</h3>
        <ul className="space-y-3">
          {activities.map((activity, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-3 sm:p-4 bg-gray-50 rounded-lg shadow-sm border break-words text-sm sm:text-base"
            >
              {activity}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Home;
