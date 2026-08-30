import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageUploadField } from '../ImageUploadField';

describe('ImageUploadField', () => {
  beforeEach(() => {
    let callCount = 0;
    // A distinct URL per call: React bails out of a state update (and skips
    // the effect) when setPreviewUrl receives the same string as before.
    URL.createObjectURL = vi.fn(() => `blob:mock-preview-${callCount++}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a preview and updates the label once a file is selected', () => {
    render(<ImageUploadField label="Image de couverture" name="cover" />);

    expect(screen.getByText('Ajouter une image')).toBeInTheDocument();

    const file = new File(['content'], 'cover.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/Image de couverture/), { target: { files: [file] } });

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(screen.getByText("Changer l'image")).toBeInTheDocument();
  });

  it('revokes the previous preview URL when the selection changes', () => {
    render(<ImageUploadField label="Image de couverture" name="cover" />);
    const input = screen.getByLabelText(/Image de couverture/);

    fireEvent.change(input, {
      target: { files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.change(input, {
      target: { files: [new File(['b'], 'b.jpg', { type: 'image/jpeg' })] },
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-preview-0');
  });
});
