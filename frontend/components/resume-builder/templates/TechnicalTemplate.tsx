'use client';

import React from 'react';
import { ResumeData } from '@/types/builder';

interface TemplateProps {
  data: ResumeData;
}

export default function TechnicalTemplate({ data }: TemplateProps) {
  const { personalInfo: p, summary, experience, projects, education, skills, additional, sectionOrder } = data;

  const contactLine = [
    p.email,
    p.phone,
    p.location,
    p.linkedin ? p.linkedin.replace(/^https?:\/\/(www\.)?/, '') : '',
    p.github ? p.github.replace(/^https?:\/\/(www\.)?/, '') : '',
    p.website ? p.website.replace(/^https?:\/\/(www\.)?/, '') : '',
  ].filter(Boolean).join(' | ');

  const renderSection = (key: string) => {
    switch (key) {
      case 'summary':
        if (!summary?.trim()) return null;
        return (
          <section key="summary" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              SUMMARY
            </h2>
            <p className="text-[10px] text-black leading-relaxed">
              {summary}
            </p>
          </section>
        );

      case 'skills':
        const tech = skills?.technical || [];
        const soft = skills?.soft || [];
        if (!tech.length && !soft.length) return null;
        return (
          <section key="skills" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              TECHNICAL SKILLS
            </h2>
            <div className="text-[10px] text-black space-y-0.5 leading-snug">
              {tech.length > 0 && (
                <div>
                  <span className="font-bold">Technologies & Tools: </span>
                  <span>{tech.map((s) => s.name).join(', ')}</span>
                </div>
              )}
              {soft.length > 0 && (
                <div>
                  <span className="font-bold">Core Competencies: </span>
                  <span>{soft.map((s) => s.name).join(', ')}</span>
                </div>
              )}
            </div>
          </section>
        );

      case 'experience':
        if (!experience?.length) return null;
        return (
          <section key="experience" className="mb-3">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono break-inside-avoid">
              EXPERIENCE
            </h2>
            <div className="space-y-2.5">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline text-[10.5px]">
                    <span className="font-bold text-black">
                      {exp.company}
                      {exp.location ? ` — ${exp.location}` : ''}
                    </span>
                    <span className="text-black font-medium">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[10px] text-black italic font-medium mb-1">
                    {exp.title}
                  </div>
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 text-[9.5px] text-black leading-relaxed">
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
          <section key="projects" className="mb-3">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono break-inside-avoid">
              PROJECTS
            </h2>
            <div className="space-y-2">
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex justify-between items-baseline text-[10.5px]">
                    <span className="font-bold text-black">
                      {proj.title}
                      {proj.technologies?.length ? ` | ${proj.technologies.join(', ')}` : ''}
                    </span>
                    <div className="text-[9.5px] text-black">
                      {[proj.projectUrl, proj.githubUrl].filter(Boolean).join(' | ')}
                    </div>
                  </div>
                  {proj.description && (
                    <p className="text-[9.5px] text-black mb-0.5">{proj.description}</p>
                  )}
                  {proj.bullets?.length ? (
                    <ul className="list-disc ml-4 space-y-0.5 text-[9.5px] text-black leading-relaxed">
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
          <section key="education" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              EDUCATION
            </h2>
            <div className="space-y-1.5 text-[10px] text-black">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold">{edu.institution}</span> — {edu.degree} in {edu.fieldOfStudy}
                    {edu.gpa ? ` (GPA: ${edu.gpa})` : ''}
                  </div>
                  <span>
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!additional?.enabledSections?.certifications || !additional?.certifications?.length) return null;
        return (
          <section key="certifications" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              CERTIFICATIONS
            </h2>
            <ul className="list-disc ml-4 space-y-0.5 text-[9.5px] text-black">
              {additional.certifications.map((c) => (
                <li key={c.id}>
                  <span className="font-bold">{c.name}</span>, {c.issuer} ({c.date})
                </li>
              ))}
            </ul>
          </section>
        );

      case 'achievements':
        if (!additional?.enabledSections?.achievements || !additional?.achievements?.length) return null;
        return (
          <section key="achievements" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              HONORS & AWARDS
            </h2>
            <ul className="list-disc ml-4 space-y-0.5 text-[9.5px] text-black">
              {additional.achievements.map((a) => (
                <li key={a.id}>
                  <span className="font-bold">{a.title}:</span> {a.description}
                </li>
              ))}
            </ul>
          </section>
        );

      case 'languages':
        if (!additional?.enabledSections?.languages || !additional?.languages?.length) return null;
        return (
          <section key="languages" className="mb-3 break-inside-avoid">
            <h2 className="text-[11.5px] font-bold text-black uppercase tracking-wider border-b border-black pb-0.5 mb-1.5 font-mono">
              LANGUAGES
            </h2>
            <p className="text-[9.5px] text-black">
              {additional.languages.map((l) => `${l.language} (${l.proficiency})`).join(', ')}
            </p>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="font-sans text-black p-8 sm:p-12 bg-white max-w-[800px] mx-auto leading-normal">
      {/* Header */}
      <header className="text-center mb-3">
        <h1 className="text-xl font-bold uppercase tracking-wider text-black">
          {p.fullName || 'YOUR NAME'}
        </h1>
        {contactLine && (
          <div className="text-[9.5px] text-black mt-1">
            {contactLine}
          </div>
        )}
      </header>

      {/* Ordered Sections */}
      <div>{sectionOrder.map((key) => renderSection(key))}</div>
    </div>
  );
}
