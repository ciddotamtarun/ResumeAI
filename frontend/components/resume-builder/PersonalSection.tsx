'use client';

import React from 'react';
import { User, Mail, Phone, MapPin, Link2, Code2, Globe, Briefcase } from 'lucide-react';
import { ResumeContact } from '@/types/builder';

interface PersonalSectionProps {
  contact: ResumeContact;
  onChange: (contact: ResumeContact) => void;
}

export default function PersonalSection({ contact, onChange }: PersonalSectionProps) {
  const handleChange = (field: keyof ResumeContact, value: string) => {
    onChange({
      ...contact,
      [field]: value,
    });
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-[#E7E1D4]">
        <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
          <User className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#171A35]">Personal Information</h3>
          <p className="text-xs text-[#77798B]">Your primary contact and header details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Alex Vance"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* Professional Title */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Professional Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.jobTitle}
              onChange={(e) => handleChange('jobTitle', e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={contact.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="alex.vance@example.com"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* City and Location */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Location / City
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="San Francisco, CA"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            LinkedIn Profile
          </label>
          <div className="relative">
            <Link2 className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/alexvance"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            GitHub URL
          </label>
          <div className="relative">
            <Code2 className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.github}
              onChange={(e) => handleChange('github', e.target.value)}
              placeholder="github.com/alexvance"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>

        {/* Portfolio / Personal Website */}
        <div>
          <label className="block text-xs font-semibold text-[#171A35] mb-1">
            Portfolio / Website
          </label>
          <div className="relative">
            <Globe className="w-3.5 h-3.5 text-[#77798B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contact.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="alexvance.dev"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F1] border border-[#E7E1D4] focus:outline-none focus:border-[#4F46D8] text-[#171A35] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
