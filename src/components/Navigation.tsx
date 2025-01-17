import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, PieChart, BarChart2, LineChart, Home } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/studies', icon: FileText, label: 'Studies' },
  { to: '/polls', icon: PieChart, label: 'Polls' },
  { to: '/data', icon: BarChart2, label: 'Data' },
  { to: '/visualizations', icon: LineChart, label: 'Visualizations' },
];

export function Navigation() {
  return (
    <nav className="col-span-3">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
        <ul className="space-y-2">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}