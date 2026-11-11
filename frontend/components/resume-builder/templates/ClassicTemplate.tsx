'use client';

import React from 'react';
import { ResumeData } from '@/types/builder';
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Code } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
}

export default function ClassicTemplate({ data }: TemplateProps) {
  const { personalInfo: p, summary, experience, projects, education, skills, additional, sectionOrder } = data;

  const contactItems = [
    p.email && { icon: Mail, text: p.email, href: `mailto:${p.email}` },
    p.phone && { icon: Phone, text: p.phone, href: `tel:${p.phone}` },
    p.location && { icon: MapPin, text: p.location },
    p.linkedin && { icon: LinkIcon, text: p.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}` },
    p.github && { icon: Code, text: p.github.replace(/^https?:\/\/(www\.)?/, ''), href: p.github.startsWith('http') ? p.github : `https://${p.github}` },
    p.website && { icon: Globe, text: p.website.replace(/^https?:\/\/(www\.)?/, ''), href: p.website.startsWith('http') ? p.website : `https://${p.website}` },
  ].filter(Boolean) as Array<{ icon: LucideIcon; text: string; href?: string }>;

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summary?.trim()) return null;
        return (
          <section key="summary" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Professional Summary
            </h2>
            <p className="text-[11px] leading-relaxed text-gray-800 text-justify">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (!experience?.length) return null;
        return (
          <section key="experience" className="mb-4">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif break-inside-avoid">
              Work Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-gray-900">{exp.title}</span>
                    <span className="text-gray-600 font-medium">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] text-gray-700 italic mb-1">
                    <span>{exp.company}{exp.employmentType ? ` • ${exp.employmentType}` : ''}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 text-[10.5px] text-gray-800 leading-relaxed">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!projects?.length) return null;
        return (
          <section key="projects" className="mb-4">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif break-inside-avoid">
              Projects
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-gray-900">
                      {proj.title}
                      {proj.projectUrl && (
                        <span className="text-gray-500 font-normal ml-1">
                          | <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">{proj.projectUrl.replace(/^https?:\/\//, '')}</a>
                        </span>
                      )}
                    </span>
                  </div>
                  {proj.technologies?.length > 0 && (
                    <div className="text-[10px] text-gray-600 italic mb-1">
                      Technologies: {proj.technologies.join(', ')}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-[10.5px] text-gray-800 mb-1 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets?.length ? (
                    <ul className="list-disc ml-4 space-y-0.5 text-[10px] text-gray-800 leading-relaxed">
                      {proj.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (!education?.length) return null;
        return (
          <section key="education" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-gray-900">{edu.institution}</span>
                    <span className="text-gray-600 font-medium">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[10.5px] text-gray-700">
                    <span>
                      {edu.degree} in {edu.fieldOfStudy}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-[10px] text-gray-600 italic mt-0.5">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        const tech = skills?.technical || [];
        const soft = skills?.soft || [];
        if (!tech.length && !soft.length) return null;
        return (
          <section key="skills" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Skills & Proficiencies
            </h2>
            <div className="space-y-1 text-[10.5px] text-gray-800 leading-relaxed">
              {tech.length > 0 && (
                <div>
                  <span className="font-bold text-gray-900">Technical Skills: </span>
                  <span>{tech.map((s) => s.name).join(', ')}</span>
                </div>
              )}
              {soft.length > 0 && (
                <div>
                  <span className="font-bold text-gray-900">Soft Skills: </span>
                  <span>{soft.map((s) => s.name).join(', ')}</span>
                </div>
              )}
            </div>
          </section>
        );

      case 'certifications':
        if (!additional?.enabledSections?.certifications || !additional?.certifications?.length) return null;
        return (
          <section key="certifications" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Certifications
            </h2>
            <ul className="list-disc ml-4 space-y-0.5 text-[10.5px] text-gray-800">
              {additional.certifications.map((c) => (
                <li key={c.id}>
                  <span className="font-bold">{c.name}</span> — {c.issuer} {c.date && `(${c.date})`}
                </li>
              ))}
            </ul>
          </section>
        );

      case 'achievements':
        if (!additional?.enabledSections?.achievements || !additional?.achievements?.length) return null;
        return (
          <section key="achievements" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Achievements
            </h2>
            <ul className="list-disc ml-4 space-y-0.5 text-[10.5px] text-gray-800">
              {additional.achievements.map((a) => (
                <li key={a.id}>
                  <span className="font-bold">{a.title}</span>
                  {a.date && <span className="text-gray-600"> ({a.date})</span>}
                  {a.description && <>: {a.description}</>}
                </li>
              ))}
            </ul>
          </section>
        );

      case 'coursework':
        if (!additional?.enabledSections?.coursework || !additional.coursework?.some((course) => course.trim())) return null;
        return (
          <section key="coursework" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Relevant Coursework
            </h2>
            <p className="text-[10.5px] text-gray-800">
              {additional.coursework.filter((course) => course.trim()).join(' • ')}
            </p>
          </section>
        );

      case 'languages':
        if (!additional?.enabledSections?.languages || !additional?.languages?.length) return null;
        return (
          <section key="languages" className="mb-4 break-inside-avoid">
            <h2 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-400 pb-1 mb-2 font-serif">
              Languages
            </h2>
            <p className="text-[10.5px] text-gray-800">
              {additional.languages.map((l) => `${l.language} (${l.proficiency})`).join(' • ')}
            </p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="font-serif text-gray-900 p-8 sm:p-12 bg-white max-w-[800px] mx-auto leading-normal">
      {/* Header */}
      <header className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900 font-serif">
          {p.fullName || 'YOUR NAME'}
        </h1>
        {p.jobTitle && (
          <div className="text-[12px] font-semibold tracking-wide text-gray-700 uppercase mt-0.5">
            {p.jobTitle}
          </div>
        )}

        {/* Contact bar */}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-700">
            {contactItems.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span className="text-gray-400 mr-1">•</span>}
                {item.href ? (
                  <a href={item.href} className="hover:text-blue-700 underline text-gray-800">
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Ordered Sections */}
      <div>{sectionOrder.map((key) => renderSection(key))}</div>
    </div>
  );
}
