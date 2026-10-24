import { useEffect, useMemo, useState } from 'react';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, CircleHelp, FilePlus2, Home, MapPin, Save, Trash2 } from 'lucide-react';
import { ListingPhotoUploadArea, PhotoGallery, type ListingPhoto } from './components/ListingPhotos';
import { deletePhotosForDraft } from './lib/photoStorage';

type Draft = {
  id: string; title: string; step: number; updatedAt: string; status: 'Draft' | 'Ready';
  address: string; city: string; state: string; zip: string; listingType: string; propertyType: string; price: string;
  bedrooms: string; bathrooms: string; squareFeet: string; lotSize: string; yearBuilt: string;
  features: string[]; parking: string; headline: string; description: string; photos: ListingPhoto[]; coverPhotoId: string | null;
};

const STORAGE_KEY = 'fieldnote-listing-drafts-v1';
const steps = [
  { label: 'Property basics', hint: 'Where it is & what it is' },
  { label: 'Property details', hint: 'The numbers that matter' },
  { label: 'Features', hint: 'What makes it special' },
  { label: 'Description', hint: 'Bring it all together' },
];
const amenities = ['Air conditioning', 'Fireplace', 'Hardwood floors', 'Updated kitchen', 'Outdoor space', 'Swimming pool', 'Mountain views', 'Walk-in closet', 'Solar panels'];
const blankDraft = (id: string): Draft => ({
  id, title: 'Untitled property', step: 0, updatedAt: new Date().toISOString(), status: 'Draft',
  address: '', city: '', state: '', zip: '', listingType: '', propertyType: '', price: '',
  bedrooms: '', bathrooms: '', squareFeet: '', lotSize: '', yearBuilt: '',
  features: [], parking: '', headline: '', description: '', photos: [], coverPhotoId: null,
});
const readDrafts = (): Draft[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const draft = item as Draft;
      const photos = Array.isArray(draft.photos) ? draft.photos : [];
      const coverPhotoId = typeof draft.coverPhotoId === 'string' && photos.some((photo) => photo.id === draft.coverPhotoId)
        ? draft.coverPhotoId
        : photos[0]?.id ?? null;
      return { ...draft, photos, coverPhotoId };
    });
  }
  catch { return []; }
};
const completion = (d: Draft) => {
  const checks = [
    !!d.address, !!d.city, !!d.state, /^\d{5}$/.test(d.zip), !!d.listingType, !!d.propertyType, !!d.price,
    !!d.bedrooms, !!d.bathrooms, !!d.squareFeet, !!d.lotSize, !!d.yearBuilt,
    d.features.length > 0 || !!d.parking, !!d.headline.trim(), d.description.trim().length >= 40,
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
};
const niceDate = (date: string) => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return 'Recently updated';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(value);
};
const titleFor = (draft: Draft) => draft.address.trim() || draft.title;

function ListingWorkspace() {
  const [location, setLocation] = useLocation();
  const [drafts, setDrafts] = useState<Draft[]>(readDrafts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (location === '/listing-draft' || location === '/listing-draft/') {
      setLocation('/', { replace: true });
    }
  }, [location, setLocation]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts)); setSaveState('saved'); }
      catch { setSaveState('error'); }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [drafts]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const match = location.match(/^\/draft\/([^/]+)\/?$/);
    setActiveId(match ? decodeURIComponent(match[1]) : null);
  }, [location]);
  const draft = useMemo(() => drafts.find((item) => item.id === activeId), [drafts, activeId]);

  const createDraft = () => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const next = blankDraft(id);
    setDrafts((current) => [next, ...current]);
    setLocation(`/draft/${id}`);
  };
  const updateDraft = (patch: Partial<Draft>) => {
    if (!activeId) return;
    setSaveState('saving');
    setDrafts((current) => current.map((item) => item.id === activeId ? {
      ...item, ...patch, updatedAt: new Date().toISOString(),
      status: patch.status ?? (Object.keys(patch).some((key) => key !== 'step' && key !== 'updatedAt') ? 'Draft' : item.status),
      title: patch.address !== undefined || patch.city !== undefined
        ? (patch.address ?? item.address).trim() || (patch.city ?? item.city).trim() || 'Untitled property'
        : item.title,
    } : item));
  };
  const removeDraft = async (id: string) => {
    const removedDraft = drafts.find((item) => item.id === id);
    if (removedDraft?.photos.length) {
      try {
        await deletePhotosForDraft(id);
      } catch {
        setToast('Could not remove this draft’s photos from this browser. Please try again.');
        return;
      }
    }
    setDrafts((current) => current.filter((item) => item.id !== id));
    setDeleteId(null);
    if (activeId === id) setLocation('/');
    setToast('Draft deleted from this browser.');
  };
  const currentStep = draft?.step ?? 0;
  const stepIsValid = (step: number) => {
    if (!draft) return false;
    if (step === 0) return !!draft.address.trim() && !!draft.city.trim() && /^[A-Za-z]{2}$/.test(draft.state.trim()) && /^\d{5}$/.test(draft.zip) && !!draft.listingType && !!draft.propertyType && Number(draft.price) > 0;
    if (step === 1) return ['bedrooms', 'bathrooms', 'squareFeet', 'lotSize', 'yearBuilt'].every((key) => Number(draft[key as keyof Draft]) > 0);
    if (step === 2) return draft.features.length > 0 || !!draft.parking;
    return !!draft.headline.trim() && draft.description.trim().length >= 40;
  };
  const goStep = (step: number) => {
    if (!draft) return;
    if (step > currentStep && !stepIsValid(currentStep)) {
      setToast(currentStep === 0 ? 'Complete the required basics before moving on.' : 'Add the required details before moving on.');
      return;
    }
    updateDraft({ step });
  };
  const markReady = () => {
    if (!draft) return;
    const firstInvalid = [0, 1, 2, 3].find((step) => !stepIsValid(step));
    if (firstInvalid !== undefined) {
      updateDraft({ step: firstInvalid });
      setToast('A few details still need your attention.');
      return;
    }
    updateDraft({ status: 'Ready', step: 3 });
    setToast('Draft marked ready. It stays saved here in your browser.');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="brand" data-testid="link-home" onClick={() => setLocation('/')} aria-label="Fieldnote home">
          <span className="brand-mark"><Home size={17} strokeWidth={2.3} /></span> fieldnote
        </button>
        <div className="top-meta"><Save size={14} /><span>Your work saves automatically</span></div>
      </header>
      <Switch>
        <Route path="/">
          <main className="main-wrap">
            <div className="home-head">
              <div>
                <div className="eyebrow">Your listing workspace</div>
                <h1 className="hero-title">Good listings<br />start with good notes.</h1>
                <p className="hero-copy">A calm place to gather the details, find the right words, and shape your next property listing — one step at a time.</p>
              </div>
              <button className="primary-btn" onClick={createDraft} data-testid="button-create-listing"><FilePlus2 size={17} /> Start a listing</button>
            </div>
            <div className="draft-toolbar">
              <div className="eyebrow">Saved drafts <span className="draft-count" data-testid="text-draft-count">· {drafts.length}</span></div>
              {drafts.length > 0 && <span className="draft-count">Stored on this device</span>}
            </div>
            {drafts.length === 0 ? (
              <section className="empty-state" data-testid="empty-drafts">
                <div className="empty-icon"><MapPin size={23} /></div>
                <h2>Your first property, whenever you're ready.</h2>
                <p>Start with the address. Your progress is saved automatically, so you can step away and pick up right where you left off.</p>
                <button className="primary-btn" onClick={createDraft} data-testid="button-create-first"><FilePlus2 size={16} /> Create your first listing</button>
              </section>
            ) : (
              <div className="draft-grid" data-testid="list-saved-drafts">
                {drafts.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((item) => {
                  const progress = completion(item);
                  return (
                    <article className="draft-card" key={item.id} data-testid={`card-draft-${item.id}`}>
                      <div className="card-top">
                        <div><h2 className="property-name" data-testid={`text-draft-title-${item.id}`}>{titleFor(item)}</h2>
                          <div className="card-location">{item.city ? `${item.city}${item.state ? `, ${item.state.toUpperCase()}` : ''}` : 'Address not added yet'}</div>
                        </div>
                        <span className={`status-pill ${item.status === 'Ready' ? 'ready' : ''}`} data-testid={`status-draft-${item.id}`}>{item.status === 'Ready' ? 'READY' : 'IN PROGRESS'}</span>
                      </div>
                      <div className="progress-head"><span>Listing details</span><span data-testid={`text-progress-${item.id}`}>{progress}%</span></div>
                      <div className="progress-track" role="progressbar" aria-label={`${titleFor(item)} completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                      <div className="card-bottom">
                        <span className="card-updated" data-testid={`text-updated-${item.id}`}>Edited {niceDate(item.updatedAt)}</span>
                        <div className="card-actions">
                          <button className="quiet-btn" aria-label={`Delete ${titleFor(item)}`} title="Delete draft" data-testid={`button-delete-${item.id}`} onClick={() => setDeleteId(item.id)}><Trash2 size={15} /></button>
                          <button className="text-action" data-testid={`button-resume-${item.id}`} onClick={() => setLocation(`/draft/${item.id}`)}>Resume <ChevronRight size={14} style={{ verticalAlign: 'middle' }} /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 28, color: '#9ba097', fontSize: 10 }}><CircleHelp size={13} /> Drafts are stored only in this browser. Nothing is published or sent anywhere.</div>
          </main>
        </Route>
        <Route path="/draft/:id">
          {draft ? <main className="editor-wrap">
            <button className="back-link" onClick={() => setLocation('/')} data-testid="link-back-to-drafts"><ArrowLeft size={15} /> All drafts</button>
            <div className="editor-heading">
              <div><div className="eyebrow">Listing draft · {draft.status === 'Ready' ? 'Ready for your next step' : 'In progress'}</div>
                <h1 className="editor-title">{titleFor(draft)}</h1>
                <p className="editor-subtitle">Take it one step at a time. You can leave and come back whenever.</p>
              </div>
              <div className={`save-state ${saveState}`} data-testid="status-save-state"><span className="save-dot" />{saveState === 'saving' ? 'Saving changes…' : saveState === 'error' ? 'Could not save on this device' : 'Saved on this device'}</div>
            </div>
            <div className="editor-layout">
              <nav className="step-panel" aria-label="Listing steps" data-testid="nav-listing-steps">
                {steps.map((item, index) => <button key={item.label} className={`step-item ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'done' : ''}`} onClick={() => goStep(index)} data-testid={`button-step-${index + 1}`} aria-current={currentStep === index ? 'step' : undefined}>
                  <span className="step-number">{index < currentStep ? <Check size={14} /> : index + 1}</span>
                  <span><span className="step-label">{item.label}</span><span className="step-hint">{item.hint}</span></span>
                </button>)}
              </nav>
              <section className="step-content" key={currentStep} aria-live="polite">
                {currentStep === 0 && <Basics draft={draft} update={updateDraft} />}
                {currentStep === 1 && <Details draft={draft} update={updateDraft} />}
                {currentStep === 2 && <Features draft={draft} update={updateDraft} onToast={setToast} />}
                {currentStep === 3 && <Review draft={draft} update={updateDraft} />}
                <div className="editor-footer">
                  <span className="footer-note">Your draft stays in this browser.</span>
                  <div style={{ display: 'flex', gap: 9 }}>
                    {currentStep > 0 && <button className="secondary-btn" onClick={() => goStep(currentStep - 1)} data-testid="button-previous-step"><ArrowLeft size={15} /> Previous</button>}
                    {currentStep < 3 ? <button className="primary-btn" onClick={() => goStep(currentStep + 1)} data-testid="button-next-step">Continue <ArrowRight size={15} /></button>
                      : <button className="primary-btn" onClick={markReady} data-testid="button-mark-ready"><CheckCircle2 size={16} /> Mark draft ready</button>}
                  </div>
                </div>
              </section>
            </div>
          </main> : <main className="main-wrap"><section className="empty-state"><div className="empty-icon"><MapPin size={23} /></div><h2>We couldn't find that draft.</h2><p>It may have been deleted from this browser.</p><button className="primary-btn" onClick={() => setLocation('/')} data-testid="button-return-home"><ArrowLeft size={15} /> Back to drafts</button></section></main>}
        </Route>
        <Route><main className="main-wrap"><section className="empty-state"><h2>That page isn't here.</h2><button className="primary-btn" onClick={() => setLocation('/')}>Return to drafts</button></section></main></Route>
      </Switch>
      {deleteId && <div className="confirm-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
        <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-heading" aria-describedby="delete-copy" data-testid="dialog-confirm-delete">
          <h2 id="delete-heading">Delete this draft?</h2><p id="delete-copy">“{titleFor(drafts.find((item) => item.id === deleteId) ?? blankDraft(''))}” will be removed from this browser. This can't be undone.</p>
          <div className="confirm-actions"><button className="secondary-btn" onClick={() => setDeleteId(null)} data-testid="button-cancel-delete">Keep draft</button><button className="danger-btn" onClick={() => removeDraft(deleteId)} data-testid="button-confirm-delete">Delete draft</button></div>
        </section>
      </div>}
      {toast && <div className="toast" role="status" data-testid="status-toast">{toast}</div>}
    </div>
  );
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ListingWorkspace />
    </WouterRouter>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text', error, helper, testId, min, max, step }: {
  label: string; name: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string;
  error?: string; helper?: string; testId?: string; min?: string; max?: string; step?: string;
}) {
  return <div className="field">
    <label htmlFor={name}>{label}</label>
    <input id={name} name={name} type={type} value={value} placeholder={placeholder} min={min} max={max} step={step} onChange={(event) => onChange(event.target.value)} data-testid={testId ?? `input-${name}`} aria-invalid={!!error} aria-describedby={error ? `${name}-error` : helper ? `${name}-helper` : undefined} />
    {error && <span className="field-error" id={`${name}-error`}>{error}</span>}
    {helper && <span className="helper" id={`${name}-helper`}>{helper}</span>}
  </div>;
}
function SelectField({ label, name, value, onChange, options, testId }: { label: string; name: string; value: string; onChange: (v: string) => void; options: string[]; testId?: string }) {
  return <div className="field"><label htmlFor={name}>{label}</label><select id={name} name={name} value={value} onChange={(event) => onChange(event.target.value)} data-testid={testId ?? `select-${name}`}>
    <option value="">Choose one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}
  </select></div>;
}
function Basics({ draft, update }: { draft: Draft; update: (patch: Partial<Draft>) => void }) {
  const [touched, setTouched] = useState(false);
  const addressError = touched && !draft.address.trim() ? 'Add the property street address.' : '';
  const zipError = touched && draft.zip && !/^\d{5}$/.test(draft.zip) ? 'Enter a 5-digit ZIP code.' : '';
  const stateError = touched && draft.state && !/^[a-z]{2}$/i.test(draft.state) ? 'Use the 2-letter state abbreviation.' : '';
  return <>
    <div className="section-kicker">Step 01 / 04</div><h2 className="section-title">Start with the essentials.</h2><p className="section-desc">A few details give this property a place to call home.</p>
    <div className="field-grid">
      <div className="field full"><Field label="Street address" name="address" value={draft.address} placeholder="123 Juniper Lane" onChange={(v) => { update({ address: v }); setTouched(true); }} error={addressError} /></div>
      <Field label="City" name="city" value={draft.city} placeholder="Boulder" onChange={(v) => update({ city: v })} />
      <Field label="State" name="state" value={draft.state} placeholder="CO" onChange={(v) => update({ state: v.toUpperCase().slice(0, 2) })} error={stateError} />
      <Field label="ZIP code" name="zip" value={draft.zip} placeholder="80302" onChange={(v) => update({ zip: v.replace(/\D/g, '').slice(0, 5) })} error={zipError} />
      <Field label="Asking price" name="price" type="number" min="1" step="1000" value={draft.price} placeholder="685000" onChange={(v) => update({ price: v })} helper="USD · Enter the full asking price" />
      <div className="field full"><label>Listing type</label><div className="choice-row" role="group" aria-label="Listing type">{['For sale', 'For rent'].map((value) => <button key={value} type="button" className={`choice-btn ${draft.listingType === value ? 'selected' : ''}`} onClick={() => update({ listingType: value })} aria-pressed={draft.listingType === value} data-testid={`button-listing-type-${value.toLowerCase().replace(' ', '-')}`}>{value}</button>)}</div></div>
      <div className="field full"><SelectField label="Property type" name="propertyType" value={draft.propertyType} onChange={(v) => update({ propertyType: v })} options={['Single-family home', 'Condominium', 'Townhouse', 'Multi-family', 'Land', 'Manufactured home']} /></div>
    </div>
  </>;
}
function Details({ draft, update }: { draft: Draft; update: (patch: Partial<Draft>) => void }) {
  return <>
    <div className="section-kicker">Step 02 / 04</div><h2 className="section-title">The details buyers look for.</h2><p className="section-desc">Numbers help people picture how the space lives. Add your best-known figures.</p>
    <div className="field-grid">
      <Field label="Bedrooms" name="bedrooms" type="number" min="0" step="1" value={draft.bedrooms} placeholder="3" onChange={(v) => update({ bedrooms: v })} />
      <Field label="Bathrooms" name="bathrooms" type="number" min="0" step="0.5" value={draft.bathrooms} placeholder="2.5" onChange={(v) => update({ bathrooms: v })} />
      <Field label="Interior square feet" name="squareFeet" type="number" min="1" value={draft.squareFeet} placeholder="1,840" onChange={(v) => update({ squareFeet: v })} />
      <Field label="Lot size (sq ft)" name="lotSize" type="number" min="1" value={draft.lotSize} placeholder="6,250" onChange={(v) => update({ lotSize: v })} />
      <Field label="Year built" name="yearBuilt" type="number" min="1800" max={String(new Date().getFullYear())} value={draft.yearBuilt} placeholder="1998" onChange={(v) => update({ yearBuilt: v })} />
      <p className="helper" style={{ alignSelf: 'end', marginBottom: 12 }}>Approximate measurements are fine for a working draft.</p>
    </div>
  </>;
}
function Features({ draft, update, onToast }: { draft: Draft; update: (patch: Partial<Draft>) => void; onToast: (message: string) => void }) {
  const toggle = (feature: string) => update({ features: draft.features.includes(feature) ? draft.features.filter((item) => item !== feature) : [...draft.features, feature] });
  return <>
    <div className="section-kicker">Step 03 / 04</div><h2 className="section-title">Give the good things their due.</h2><p className="section-desc">Choose the features that make this property feel like somewhere to be.</p>
    <div className="subheading" style={{ marginTop: 0 }}>Standout features <span className="helper">· Select all that apply</span></div>
    <div className="amenity-grid">{amenities.map((feature) => {
      const selected = draft.features.includes(feature);
      return <button type="button" key={feature} className={`amenity ${selected ? 'selected' : ''}`} aria-pressed={selected} onClick={() => toggle(feature)} data-testid={`button-feature-${feature.toLowerCase().replaceAll(' ', '-')}`}><span className="checkmark">{selected && <Check size={11} />}</span>{feature}</button>;
    })}</div>
    <div className="subheading">Parking</div>
    <div className="choice-row" role="group" aria-label="Parking options">{['No dedicated parking', '1-car garage', '2-car garage', 'Carport', 'Off-street parking'].map((value) => <button type="button" key={value} className={`choice-btn ${draft.parking === value ? 'selected' : ''}`} onClick={() => update({ parking: draft.parking === value ? '' : value })} aria-pressed={draft.parking === value} data-testid={`button-parking-${value.toLowerCase().replaceAll(' ', '-')}`}>{value}</button>)}</div>
    <ListingPhotoUploadArea
      draftId={draft.id}
      photos={draft.photos}
      onChange={(photos) => update({ photos })}
      coverPhotoId={draft.coverPhotoId}
      onCoverChange={(coverPhotoId) => update({ coverPhotoId })}
      onToast={onToast}
    />
  </>;
}
function Review({ draft, update }: { draft: Draft; update: (patch: Partial<Draft>) => void }) {
  const [touched, setTouched] = useState(false);
  const price = draft.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(draft.price)) : '—';
  return <>
    <div className="section-kicker">Step 04 / 04</div><h2 className="section-title">Make the first impression count.</h2><p className="section-desc">A clear headline and a thoughtful description turn facts into a feeling.</p>
    <div className="field-grid">
      <div className="field full"><Field label="Listing headline" name="headline" value={draft.headline} placeholder="A sunlit retreat with room to breathe" onChange={(v) => { update({ headline: v }); setTouched(true); }} helper={`${draft.headline.length}/80 characters`} /><span className="field-error" aria-live="polite">{touched && !draft.headline.trim() ? 'Add a short, specific headline.' : ''}</span></div>
      <div className="field full"><label htmlFor="description">Listing description</label><textarea id="description" value={draft.description} maxLength={1200} placeholder="What does a morning here feel like? Share the details that make this place distinct." onChange={(event) => update({ description: event.target.value })} data-testid="input-description" aria-describedby="description-helper" /><span className="helper" id="description-helper">{draft.description.length}/1,200 · Aim for at least 40 characters.</span></div>
    </div>
    <div className="subheading">A quick review</div>
    <div className="review-card"><div className="review-label">Location</div><div className="review-value">{draft.address || 'Street address'}{draft.city ? ` · ${draft.city}` : ''}{draft.state ? `, ${draft.state}` : ''} {draft.zip}</div></div>
    <div className="review-grid">
      <div className="review-stat"><b>{price}</b><span>{draft.listingType || 'Listing type'}</span></div>
      <div className="review-stat"><b>{draft.bedrooms || '—'} bd · {draft.bathrooms || '—'} ba</b><span>{draft.propertyType || 'Property type'}</span></div>
      <div className="review-stat"><b>{draft.squareFeet ? `${Number(draft.squareFeet).toLocaleString()} sq ft` : '—'}</b><span>Interior</span></div>
    </div>
    <div className="review-card" style={{ marginTop: 11 }}><div className="review-label">Headline</div><div className="review-value">{draft.headline || 'Your headline will appear here'}</div></div>
    {draft.features.length > 0 && <div className="review-row"><span>Standout features</span><b>{draft.features.join(' · ')}</b></div>}
    {draft.photos.length > 0 && <>
      <div className="subheading">Property photos</div>
      <PhotoGallery draftId={draft.id} photos={draft.photos} coverPhotoId={draft.coverPhotoId} />
    </>}
    <div className="ready-banner"><CheckCircle2 size={17} /><span><b>Ready means ready for you.</b> Marking this draft ready is a personal checkpoint. It does not publish or send your listing anywhere.</span></div>
  </>;
}

export default App;
