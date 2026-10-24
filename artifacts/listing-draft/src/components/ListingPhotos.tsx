import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Star, X } from 'lucide-react';
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
  onReorder,
  coverPhotoId,
  onSelectCover,
  busy = false,
}: {
  draftId: string;
  photos: ListingPhoto[];
  onRemove?: (photo: ListingPhoto) => void;
  removingPhotoId?: string | null;
  onReorder?: (photos: ListingPhoto[]) => void;
  coverPhotoId?: string | null;
  onSelectCover?: (photo: ListingPhoto) => void;
  busy?: boolean;
}) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const photoIds = photos.map((photo) => photo.id);
  const photoIdsKey = [...photoIds].sort().join('\0');

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];
    setPreviews({});
    setLoaded(photoIds.length === 0);

    const loadPreviews = async () => {
      const entries = await Promise.all(photoIds.map(async (photoId) => {
        try {
          const blob = await getPhotoBlob(draftId, photoId);
          if (!blob) return [photoId, ''] as const;
          const url = URL.createObjectURL(blob);
          objectUrls.push(url);
          return [photoId, url] as const;
        } catch {
          return [photoId, ''] as const;
        }
      }));

      if (cancelled) {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      setPreviews(Object.fromEntries(entries.filter(([, url]) => url)));
      setLoaded(true);
    };

    if (photoIds.length > 0) void loadPreviews();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [draftId, photoIdsKey]);

  if (photos.length === 0) return null;

  return (
    <div className="photo-grid" role="list" aria-label="Uploaded property photos">
      {photos.map((photo, index) => (
        <figure className={`photo-card ${coverPhotoId === photo.id ? 'is-cover' : ''}`} role="listitem" key={photo.id} data-testid={`photo-card-${photo.id}`}>
          <div className="photo-preview">
            {previews[photo.id] ? (
              <img src={previews[photo.id]} alt={photo.name} />
            ) : (
              <div className="photo-unavailable" role="status">
                <ImagePlus size={19} />
                <span>{loaded ? 'Preview unavailable' : 'Loading preview…'}</span>
              </div>
            )}
            {coverPhotoId === photo.id && (
              <span className="photo-cover-badge"><Star size={12} fill="currentColor" /> Cover photo</span>
            )}
            {onRemove && (
              <button
                type="button"
                className="photo-remove"
                aria-label={`Remove ${photo.name}`}
                title={`Remove ${photo.name}`}
                disabled={busy || !!removingPhotoId}
                onClick={() => onRemove(photo)}
                data-testid={`button-remove-photo-${photo.id}`}
              >
                {removingPhotoId === photo.id ? <LoaderCircle size={14} className="photo-spinner" /> : <X size={14} />}
              </button>
            )}
          </div>
          <figcaption className="photo-caption">
            <span title={photo.name}>{photo.name}</span>
            <small>{formatSize(photo.size)}</small>
          </figcaption>
          {(onReorder || onSelectCover) && (
            <div className="photo-actions">
              {onSelectCover && (
                <button
                  type="button"
                  className={`photo-cover-btn ${coverPhotoId === photo.id ? 'selected' : ''}`}
                  aria-pressed={coverPhotoId === photo.id}
                  disabled={busy || !!removingPhotoId || coverPhotoId === photo.id}
                  onClick={() => onSelectCover(photo)}
                  data-testid={`button-set-cover-${photo.id}`}
                >
                  <Star size={13} fill={coverPhotoId === photo.id ? 'currentColor' : 'none'} />
                  {coverPhotoId === photo.id ? 'Cover photo' : 'Set as cover'}
                </button>
              )}
              {onReorder && (
                <div className="photo-order-controls" aria-label={`Reorder ${photo.name}`}>
                  <button
                    type="button"
                    className="photo-order-btn"
                    aria-label={`Move ${photo.name} earlier`}
                    title="Move earlier"
                    disabled={busy || !!removingPhotoId || index === 0}
                    onClick={() => {
                      const reordered = [...photos];
                      [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
                      onReorder(reordered);
                    }}
                    data-testid={`button-move-photo-up-${photo.id}`}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className="photo-order-btn"
                    aria-label={`Move ${photo.name} later`}
                    title="Move later"
                    disabled={busy || !!removingPhotoId || index === photos.length - 1}
                    onClick={() => {
                      const reordered = [...photos];
                      [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
                      onReorder(reordered);
                    }}
                    data-testid={`button-move-photo-down-${photo.id}`}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </figure>
      ))}
    </div>
  );
}

export function ListingPhotoUploadArea({
  draftId,
  photos,
  onChange,
  coverPhotoId,
  onCoverChange,
  onToast,
}: {
  draftId: string;
  photos: ListingPhoto[];
  onChange: (photos: ListingPhoto[]) => void;
  coverPhotoId: string | null;
  onCoverChange: (photoId: string | null) => void;
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

      if (added.length > 0) {
        onChange([...photos, ...added]);
        if (!coverPhotoId) onCoverChange(added[0].id);
      }

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
      const remaining = photos.filter((item) => item.id !== photo.id);
      onChange(remaining);
      if (coverPhotoId === photo.id) onCoverChange(remaining[0]?.id ?? null);
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
        onReorder={onChange}
        coverPhotoId={coverPhotoId}
        onSelectCover={(photo) => onCoverChange(photo.id)}
        busy={uploading}
      />
    </div>
  );
}
