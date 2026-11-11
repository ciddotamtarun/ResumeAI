'use client';

import React from 'react';
import { ResumeData } from '@/types/builder';
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Code } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface TemplateProps {
  data: ResumeData;
}

export default function ModernTemplate({ data }: TemplateProps) {
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Professional Summary
              </h2>
            </div>
            <p className="text-[10.5px] leading-relaxed text-[#4A4D68]">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (!experience?.length) return null;
        return (
          <section key="experience" className="mb-4">
            <div className="flex items-center gap-2 mb-2 break-inside-avoid">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Work Experience
              </h2>
            </div>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid relative pl-3 border-l-2 border-[#E7E1D4]">
                  <div className="flex justify-between items-start text-[11px]">
                    <div>
                      <span className="font-bold text-[#171A35]">{exp.title}</span>
                      <span className="text-[#4F46D8] font-medium ml-1.5">@ {exp.company}</span>
                    </div>
                    <span className="text-[10px] text-[#77798B] font-medium bg-[#F3F0FC] px-2 py-0.5 rounded">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-[10px] text-[#77798B] mt-0.5 mb-1.5">
                      {exp.location}{exp.employmentType ? ` • ${exp.employmentType}` : ''}
                    </div>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul className="list-disc ml-3.5 space-y-1 text-[10.5px] text-[#2C2F48] leading-relaxed">
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
            <div className="flex items-center gap-2 mb-2 break-inside-avoid">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Key Projects
              </h2>
            </div>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid bg-[#FAF8F1]/60 p-2.5 rounded-lg border border-[#E7E1D4]/60">
                  <div className="flex justify-between items-baseline text-[11px]">
                    <span className="font-bold text-[#171A35]">{proj.title}</span>
                    <div className="flex items-center gap-2 text-[10px]">
                      {proj.projectUrl && (
                        <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-[#4F46D8] hover:underline font-medium">
                          Demo ↗
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#77798B] hover:text-[#171A35]">
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-1">
                      {proj.technologies.map((t, idx) => (
                        <span key={idx} className="text-[9px] bg-white border border-[#E7E1D4] text-[#4F46D8] px-1.5 py-0.2 rounded font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.description && (
                    <p className="text-[10px] text-[#4A4D68] mb-1 leading-relaxed">
                      {proj.description}
                    </p>
                  )}
                  {proj.bullets?.length ? (
                    <ul className="list-disc ml-3.5 space-y-0.5 text-[9.5px] text-[#2C2F48] leading-relaxed">
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Education
              </h2>
            </div>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-[11px]">
                  <div>
                    <span className="font-bold text-[#171A35]">{edu.institution}</span>
                    <div className="text-[10px] text-[#4A4D68]">
                      {edu.degree} in {edu.fieldOfStudy}
                      {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                    </div>
                  </div>
                  <span className="text-[10px] text-[#77798B]">
                    {edu.startDate} — {edu.endDate}
                  </span>
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Skills & Technologies
              </h2>
            </div>
            <div className="space-y-1.5 text-[10px]">
              {tech.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#171A35] mr-1">Technical:</span>
                  {tech.map((s) => (
                    <span key={s.id} className="bg-[#F3F0FC] text-[#4F46D8] px-2 py-0.5 rounded text-[9.5px] font-medium border border-[#E7E1D4]">
                      {s.name}
                      {s.level ? ` (${s.level})` : ''}
                    </span>
                  ))}
                </div>
              )}
              {soft.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#171A35] mr-1">Soft Skills:</span>
                  {soft.map((s) => (
                    <span key={s.id} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[9.5px]">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case 'certifications':
        if (!additional?.enabledSections?.certifications || !additional?.certifications?.length) return null;
        return (
          <section key="certifications" className="mb-4 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Certifications
              </h2>
            </div>
            <div className="space-y-1 text-[10px] text-[#2C2F48]">
              {additional.certifications.map((c) => (
                <div key={c.id} className="flex justify-between">
                  <span className="font-semibold text-[#171A35]">{c.name} — <span className="text-[#77798B] font-normal">{c.issuer}</span></span>
                  <span className="text-[#77798B]">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'achievements':
        if (!additional?.enabledSections?.achievements || !additional?.achievements?.length) return null;
        return (
          <section key="achievements" className="mb-4 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Achievements
              </h2>
            </div>
            <ul className="list-disc ml-3.5 space-y-0.5 text-[10px] text-[#2C2F48]">
              {additional.achievements.map((a) => (
                <li key={a.id}>
                  <strong className="text-[#171A35]">{a.title}</strong>
                  {a.date && <span className="text-[#77798B]"> ({a.date})</span>}
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
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Relevant Coursework
              </h2>
            </div>
            <p className="text-[10px] text-[#2C2F48]">
              {additional.coursework.filter((course) => course.trim()).join(' • ')}
            </p>
          </section>
        );

      case 'languages':
        if (!additional?.enabledSections?.languages || !additional?.languages?.length) return null;
        return (
          <section key="languages" className="mb-4 break-inside-avoid">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-3.5 bg-[#4F46D8] rounded-full"></span>
              <h2 className="text-[12px] font-bold text-[#171A35] uppercase tracking-wider">
                Languages
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {additional.languages.map((l) => (
                <span key={l.id} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                  <strong>{l.language}</strong> ({l.proficiency})
                </span>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="font-sans text-[#171A35] p-8 sm:p-12 bg-white max-w-[800px] mx-auto leading-normal">
      {/* Header */}
      <header className="mb-5 pb-4 border-b border-[#E7E1D4]">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171A35]">
              {p.fullName || 'Your Name'}
            </h1>
            {p.jobTitle && (
              <div className="text-[12.5px] font-semibold text-[#4F46D8] mt-0.5">
                {p.jobTitle}
              </div>
            )}
          </div>
        </div>

        {/* Contact info pills */}
        {contactItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-[10px] text-[#77798B]">
            {contactItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <span key={idx} className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-[#4F46D8]" />
                  {item.href ? (
                    <a href={item.href} className="hover:text-[#4F46D8] hover:underline">
                      {item.text}
                    </a>
                  ) : (
                    <span>{item.text}</span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </header>

      {/* Ordered Sections */}
      <div>{sectionOrder.map((key) => renderSection(key))}</div>
    </div>
  );
}
