'use client';

import React from 'react';
import {
  Award,
  Globe2,
  HeartHandshake,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import {
  ResumeAward,
  ResumeCertification,
  ResumeLanguage,
  ResumeVolunteer,
  SectionKey,
} from '@/types/builder';

interface AdditionalSectionsProps {
  certifications: ResumeCertification[];
  awards: ResumeAward[];
  volunteer: ResumeVolunteer[];
  languages: ResumeLanguage[];
  enabledSections: Record<SectionKey, boolean>;
  onToggleSection: (key: SectionKey) => void;
  onUpdateCertifications: (certs: ResumeCertification[]) => void;
  onUpdateAwards: (awards: ResumeAward[]) => void;
  onUpdateVolunteer: (volunteer: ResumeVolunteer[]) => void;
  onUpdateLanguages: (languages: ResumeLanguage[]) => void;
}

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Professional', 'Conversational', 'Elementary'];

export default function AdditionalSections({
  certifications,
  awards,
  volunteer,
  languages,
  enabledSections,
  onToggleSection,
  onUpdateCertifications,
  onUpdateAwards,
  onUpdateVolunteer,
  onUpdateLanguages,
}: AdditionalSectionsProps) {
  // Handlers for Certifications
  const addCert = () => {
    onUpdateCertifications([
      ...certifications,
      { id: `cert-${Date.now()}`, name: '', issuer: '', date: '', url: '' },
    ]);
  };
  const removeCert = (id: string) => {
    onUpdateCertifications(certifications.filter((c) => c.id !== id));
  };
  const updateCert = (id: string, updates: Partial<ResumeCertification>) => {
    onUpdateCertifications(certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Handlers for Awards
  const addAward = () => {
    onUpdateAwards([
      ...awards,
      { id: `award-${Date.now()}`, title: '', issuer: '', date: '', description: '' },
    ]);
  };
  const removeAward = (id: string) => {
    onUpdateAwards(awards.filter((a) => a.id !== id));
  };
  const updateAward = (id: string, updates: Partial<ResumeAward>) => {
    onUpdateAwards(awards.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Handlers for Volunteer
  const addVolunteer = () => {
    onUpdateVolunteer([
      ...volunteer,
      { id: `vol-${Date.now()}`, role: '', organization: '', startDate: '', endDate: '', current: false, description: '' },
    ]);
  };
  const removeVolunteer = (id: string) => {
    onUpdateVolunteer(volunteer.filter((v) => v.id !== id));
  };
  const updateVolunteer = (id: string, updates: Partial<ResumeVolunteer>) => {
    onUpdateVolunteer(volunteer.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  // Handlers for Languages
  const addLanguage = () => {
    onUpdateLanguages([
      ...languages,
      { id: `lang-${Date.now()}`, language: '', proficiency: 'Professional' },
    ]);
  };
  const removeLanguage = (id: string) => {
    onUpdateLanguages(languages.filter((l) => l.id !== id));
  };
  const updateLanguage = (id: string, updates: Partial<ResumeLanguage>) => {
    onUpdateLanguages(languages.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  return (
    <div className="space-y-4">
      {/* ─── Certifications ─────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Certifications</h3>
              <p className="text-xs text-[#77798B]">Industry credentials and vendor licenses</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSection('certifications')}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                enabledSections.certifications
                  ? 'bg-[#168575]/10 text-[#168575] border-[#168575]/30'
                  : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4]'
              }`}
            >
              {enabledSections.certifications ? 'Included in Resume' : 'Excluded'}
            </button>
            {enabledSections.certifications && (
              <button
                type="button"
                onClick={addCert}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#4F46D8] text-white text-xs font-semibold hover:bg-[#4338CA]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {enabledSections.certifications && (
          <div className="space-y-3">
            {certifications.length === 0 ? (
              <p className="text-xs text-[#77798B] italic">No certifications added. Click Add to include AWS, Azure, Scrum, etc.</p>
            ) : (
              certifications.map((cert) => (
                <div key={cert.id} className="flex flex-col sm:flex-row gap-2 bg-[#FAF8F1]/60 p-3 rounded-xl border border-[#E7E1D4]">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCert(cert.id, { name: e.target.value })}
                    placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
                    placeholder="Issuing Org (e.g. Amazon Web Services)"
                    className="w-full sm:w-44 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => updateCert(cert.id, { date: e.target.value })}
                    placeholder="Date (e.g. 2023-06)"
                    className="w-full sm:w-28 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                  <button
                    type="button"
                    onClick={() => removeCert(cert.id)}
                    className="p-1.5 text-[#77798B] hover:text-red-500 rounded-lg self-end sm:self-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Awards & Honors ────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Awards & Honors</h3>
              <p className="text-xs text-[#77798B]">Hackathons, corporate excellence, scholarships</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSection('awards')}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                enabledSections.awards
                  ? 'bg-[#168575]/10 text-[#168575] border-[#168575]/30'
                  : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4]'
              }`}
            >
              {enabledSections.awards ? 'Included in Resume' : 'Excluded'}
            </button>
            {enabledSections.awards && (
              <button
                type="button"
                onClick={addAward}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#4F46D8] text-white text-xs font-semibold hover:bg-[#4338CA]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {enabledSections.awards && (
          <div className="space-y-3">
            {awards.length === 0 ? (
              <p className="text-xs text-[#77798B] italic">No awards added. Click Add to showcase accolades.</p>
            ) : (
              awards.map((award) => (
                <div key={award.id} className="bg-[#FAF8F1]/60 p-3 rounded-xl border border-[#E7E1D4] space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={award.title}
                      onChange={(e) => updateAward(award.id, { title: e.target.value })}
                      placeholder="Award Title (e.g. 1st Place National Hackathon)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <input
                      type="text"
                      value={award.issuer}
                      onChange={(e) => updateAward(award.id, { issuer: e.target.value })}
                      placeholder="Issuer (e.g. TechCrunch / Company)"
                      className="w-full sm:w-44 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <input
                      type="text"
                      value={award.date}
                      onChange={(e) => updateAward(award.id, { date: e.target.value })}
                      placeholder="Date (e.g. 2023)"
                      className="w-full sm:w-28 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <button
                      type="button"
                      onClick={() => removeAward(award.id)}
                      className="p-1.5 text-[#77798B] hover:text-red-500 rounded-lg self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={award.description || ''}
                    onChange={(e) => updateAward(award.id, { description: e.target.value })}
                    placeholder="Brief description of accomplishment (optional)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Volunteer Experience ───────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Volunteer & Leadership</h3>
              <p className="text-xs text-[#77798B]">Community involvement and leadership</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSection('volunteer')}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                enabledSections.volunteer
                  ? 'bg-[#168575]/10 text-[#168575] border-[#168575]/30'
                  : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4]'
              }`}
            >
              {enabledSections.volunteer ? 'Included in Resume' : 'Excluded'}
            </button>
            {enabledSections.volunteer && (
              <button
                type="button"
                onClick={addVolunteer}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#4F46D8] text-white text-xs font-semibold hover:bg-[#4338CA]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {enabledSections.volunteer && (
          <div className="space-y-3">
            {volunteer.length === 0 ? (
              <p className="text-xs text-[#77798B] italic">No volunteer experience added.</p>
            ) : (
              volunteer.map((vol) => (
                <div key={vol.id} className="bg-[#FAF8F1]/60 p-3 rounded-xl border border-[#E7E1D4] space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={vol.role}
                      onChange={(e) => updateVolunteer(vol.id, { role: e.target.value })}
                      placeholder="Role (e.g. Volunteer Coding Instructor)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <input
                      type="text"
                      value={vol.organization}
                      onChange={(e) => updateVolunteer(vol.id, { organization: e.target.value })}
                      placeholder="Organization (e.g. Code for America)"
                      className="w-full sm:w-44 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <input
                      type="text"
                      value={vol.startDate}
                      onChange={(e) => updateVolunteer(vol.id, { startDate: e.target.value })}
                      placeholder="Period (e.g. 2021 - Present)"
                      className="w-full sm:w-32 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                    />
                    <button
                      type="button"
                      onClick={() => removeVolunteer(vol.id)}
                      className="p-1.5 text-[#77798B] hover:text-red-500 rounded-lg self-end sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={vol.description || ''}
                    onChange={(e) => updateVolunteer(vol.id, { description: e.target.value })}
                    placeholder="Brief description of impact or activities"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── Languages ──────────────────────────────────────────────────────── */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#E7E1D4] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E1D4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F3F0FC] flex items-center justify-center text-[#4F46D8]">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#171A35]">Languages</h3>
              <p className="text-xs text-[#77798B]">Spoken and written language proficiencies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleSection('languages')}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors ${
                enabledSections.languages
                  ? 'bg-[#168575]/10 text-[#168575] border-[#168575]/30'
                  : 'bg-[#FAF8F1] text-[#77798B] border-[#E7E1D4]'
              }`}
            >
              {enabledSections.languages ? 'Included in Resume' : 'Excluded'}
            </button>
            {enabledSections.languages && (
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#4F46D8] text-white text-xs font-semibold hover:bg-[#4338CA]"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {enabledSections.languages && (
          <div className="space-y-3">
            {languages.length === 0 ? (
              <p className="text-xs text-[#77798B] italic">No languages added.</p>
            ) : (
              languages.map((lang) => (
                <div key={lang.id} className="flex gap-2 bg-[#FAF8F1]/60 p-2.5 rounded-xl border border-[#E7E1D4] items-center">
                  <input
                    type="text"
                    value={lang.language}
                    onChange={(e) => updateLanguage(lang.id, { language: e.target.value })}
                    placeholder="Language (e.g. English, Spanish, German)"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })}
                    className="w-36 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-[#E7E1D4] text-[#171A35]"
                  >
                    {PROFICIENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang.id)}
                    className="p-1.5 text-[#77798B] hover:text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
