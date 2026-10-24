import { useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { deletePhotoBlob, getPhotoBlob, savePhotoBlob } from '../lib/photoStorage';

export type ListingPhoto = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
};

const MAX_PHOTOS = 12;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function formatSize(size: number) {
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} KB`;
}

function createPhotoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PhotoGallery({
  draftId,
  photos,
  onRemove,
  removingPhotoId,
  busy = false,
}: {
  draftId: string;
  photos: ListingPhoto[];
  onRemove?: (photo: ListingPhoto) => void;
  removingPhotoId?: string | null;
  busy?: boolean;
}) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    setPreviews({});
    setLoaded(photos.length === 0);

    const loadPreviews = async () => {
      const entries = await Promise.all(photos.map(async (photo) => {
        try {
          const blob = await getPhotoBlob(draftId, photo.id);
          if (!blob) return [photo.id, ''] as const;
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          return [photo.id, url] as const;
        } catch {
          return [photo.id, ''] as const;
        }
      }));

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setPreviews(Object.fromEntries(entries.filter(([, url]) => url)));
      setLoaded(true);
    };

    if (photos.length > 0) void loadPreviews();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [draftId, photos]);

  if (photos.length === 0) return null;

  return (
    <div className="photo-grid" role="list" aria-label="Uploaded property photos">
      {photos.map((photo) => (
        <figure className="photo-card" role="listitem" key={photo.id}>
          <div className="photo-preview">
            {previews[photo.id] ? (
              <img src={previews[photo.id]} alt={photo.name} />
            ) : (
              <div className="photo-unavailable" role="status">
                <ImagePlus size={19} />
                <span>{loaded ? 'Preview unavailable' : 'Loading preview…'}</span>
              </div>
            )}
            {onRemove && (
              <button
                type="button"
                className="photo-remove"
                aria-label={`Remove ${photo.name}`}
                title={`Remove ${photo.name}`}
                disabled={busy || !!removingPhotoId}
                onClick={() => onRemove(photo)}
              >
                {removingPhotoId === photo.id ? <LoaderCircle size={14} className="photo-spinner" /> : <X size={14} />}
              </button>
            )}
          </div>
          <figcaption className="photo-caption">
            <span title={photo.name}>{photo.name}</span>
            <small>{formatSize(photo.size)}</small>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function ListingPhotoUploadArea({
  draftId,
  photos,
  onChange,
  onToast,
}: {
  draftId: string;
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
  onToast: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [removingPhotoId, setRemovingPhotoId] = useState<string | null>(null);
  const slotsRemaining = Math.max(0, MAX_PHOTOS - photos.length);
  const disabled = uploading || slotsRemaining === 0;

  const addFiles = async (files: File[]) => {
    if (files.length === 0 || uploading) return;
    if (slotsRemaining === 0) {
      onToast(`This draft already has the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    setUploading(true);
    const added: ListingPhoto[] = [];
    let unsupportedCount = 0;
    let oversizedCount = 0;
    let tooManyCount = 0;
    let storageFailed = false;

    try {
      for (const [index, file] of files.entries()) {
        if (photos.length + added.length >= MAX_PHOTOS) {
          tooManyCount = files.length - index;
          break;
        }
        if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
          unsupportedCount += 1;
          continue;
        }
        if (file.size > MAX_PHOTO_SIZE) {
          oversizedCount += 1;
          continue;
        }

        const photo: ListingPhoto = {
          id: createPhotoId(),
          name: file.name,
          mimeType: file.type,
          size: file.size,
        };
        try {
          await savePhotoBlob(draftId, photo.id, file);
          added.push(photo);
        } catch {
          storageFailed = true;
          break;
        }
      }

      if (added.length > 0) onChange([...photos, ...added]);

      const issues: string[] = [];
      if (unsupportedCount > 0) issues.push(`${unsupportedCount} unsupported file${unsupportedCount === 1 ? '' : 's'}`);
      if (oversizedCount > 0) issues.push(`${oversizedCount} file${oversizedCount === 1 ? '' : 's'} over 10 MB`);
      if (tooManyCount > 0) issues.push(`the limit is ${MAX_PHOTOS} photos per draft`);
      if (storageFailed) issues.push('browser storage could not save the remaining files');

      if (issues.length > 0) {
        const prefix = added.length > 0 ? `Added ${added.length} photo${added.length === 1 ? '' : 's'}. ` : '';
        onToast(`${prefix}Skipped ${issues.join('; ')}.`);
      } else if (added.length > 0) {
        onToast(`${added.length} photo${added.length === 1 ? '' : 's'} saved on this device.`);
      }
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (photo: ListingPhoto) => {
    setRemovingPhotoId(photo.id);
    try {
      await deletePhotoBlob(draftId, photo.id);
      onChange(photos.filter((item) => item.id !== photo.id));
    } catch {
      onToast('Could not remove that photo from this browser. Please try again.');
    } finally {
      setRemovingPhotoId(null);
    }
  };

  return (
    <div className="photo-upload-area">
      <div className="photo-upload-heading">
        <div>
          <div className="subheading photo-section-heading">Property photos <span className="helper">· Optional</span></div>
          <p className="photo-upload-note">Add up to {MAX_PHOTOS} photos. They stay in this browser on this device.</p>
        </div>
        <span className="photo-count">{photos.length} / {MAX_PHOTOS}</span>
      </div>
      <div
        className={`photo-dropzone ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        role="group"
        aria-label="Property photo upload"
        onDragEnter={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) void addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          ref={inputRef}
          className="photo-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          aria-label="Choose property photos"
          onChange={(event) => {
            const files = Array.from(event.currentTarget.files ?? []);
            event.currentTarget.value = '';
            void addFiles(files);
          }}
        />
        <div className="photo-upload-icon"><ImagePlus size={21} /></div>
        <div className="photo-upload-copy">
          <b>{uploading ? 'Saving photos…' : 'Drop property photos here'}</b>
          <span>JPG, PNG, or WebP · Up to 10 MB each</span>
        </div>
        <button
          type="button"
          className="photo-browse-btn"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <LoaderCircle size={15} className="photo-spinner" /> : <ImagePlus size={15} />}
          {uploading ? 'Saving' : slotsRemaining === 0 ? 'Photo limit reached' : 'Browse photos'}
        </button>
      </div>
      <PhotoGallery
        draftId={draftId}
        photos={photos}
        onRemove={(photo) => void removePhoto(photo)}
        removingPhotoId={removingPhotoId}
        busy={uploading}
      />
    </div>
  );
}
