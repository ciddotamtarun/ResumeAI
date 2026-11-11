import React from 'react';
import {
  Code2,
  Database,
  BarChart2,
  Settings,
  Cloud,
  Smartphone,
  TestTube,
  Shield,
  Target,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Briefcase,
  Palette,
  PenTool,
  Edit3,
  BookOpen,
  Search,
} from 'lucide-react';

export interface RoleOption {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface RoleCategory {
  category: string;
  roles: RoleOption[];
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  {
    category: '💻 Technology',
    roles: [
      { label: 'Frontend Developer', icon: Code2, color: 'from-blue-500 to-cyan-500' },
      { label: 'Backend Developer', icon: Database, color: 'from-green-500 to-emerald-500' },
      { label: 'Full Stack Developer', icon: Code2, color: 'from-indigo-500 to-purple-500' },
      { label: 'Data Scientist', icon: BarChart2, color: 'from-violet-500 to-purple-600' },
      { label: 'ML / AI Engineer', icon: Settings, color: 'from-pink-500 to-rose-500' },
      { label: 'DevOps Engineer', icon: Cloud, color: 'from-orange-500 to-amber-500' },
      { label: 'Mobile Developer', icon: Smartphone, color: 'from-teal-500 to-cyan-600' },
      { label: 'QA / Test Engineer', icon: TestTube, color: 'from-lime-500 to-green-500' },
      { label: 'Cybersecurity', icon: Shield, color: 'from-red-500 to-rose-600' },
      { label: 'Product Manager', icon: Target, color: 'from-amber-500 to-yellow-500' },
    ],
  },
  {
    category: '📊 Business & Finance',
    roles: [
      { label: 'Business Analyst', icon: BarChart2, color: 'from-blue-600 to-indigo-600' },
      { label: 'Financial Analyst', icon: DollarSign, color: 'from-emerald-600 to-teal-600' },
      { label: 'Marketing Manager', icon: TrendingUp, color: 'from-pink-600 to-fuchsia-600' },
      { label: 'Sales Executive', icon: ShoppingCart, color: 'from-orange-500 to-red-500' },
      { label: 'HR Manager', icon: Users, color: 'from-violet-500 to-indigo-500' },
      { label: 'Operations Manager', icon: Settings, color: 'from-slate-500 to-gray-600' },
      { label: 'Project Manager', icon: Briefcase, color: 'from-cyan-500 to-blue-500' },
      { label: 'Accountant', icon: DollarSign, color: 'from-green-600 to-emerald-700' },
    ],
  },
  {
    category: '🎨 Design & Creative',
    roles: [
      { label: 'UI/UX Designer', icon: Palette, color: 'from-fuchsia-500 to-pink-500' },
      { label: 'Graphic Designer', icon: Palette, color: 'from-rose-500 to-pink-600' },
      { label: 'Product Designer', icon: PenTool, color: 'from-purple-500 to-violet-600' },
      { label: 'Content Writer', icon: Edit3, color: 'from-amber-500 to-orange-500' },
      { label: 'Copywriter', icon: PenTool, color: 'from-yellow-500 to-amber-600' },
    ],
  },
  {
    category: '📚 Education & Research',
    roles: [
      { label: 'Teacher / Educator', icon: BookOpen, color: 'from-teal-500 to-green-500' },
      { label: 'Research Analyst', icon: Search, color: 'from-indigo-500 to-blue-500' },
      { label: 'Data Analyst', icon: BarChart2, color: 'from-blue-500 to-violet-500' },
    ],
  },
];

export const ALL_ROLES: string[] = ROLE_CATEGORIES.flatMap((c) => c.roles.map((r) => r.label));

export function getRoleIcon(roleName: string) {
  for (const cat of ROLE_CATEGORIES) {
    const found = cat.roles.find((r) => r.label.toLowerCase() === roleName.toLowerCase());
    if (found) return found.icon;
  }
  return Target;
}
