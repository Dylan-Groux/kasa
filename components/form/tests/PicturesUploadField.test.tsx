import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PicturesUploadField } from '../PicturesUploadField';

describe('PicturesUploadField', () => {
  beforeEach(() => {
    let callCount = 0;
    URL.createObjectURL = vi.fn(() => `blob:mock-preview-${callCount++}`);
    URL.revokeObjectURL = vi.fn();
  });

  it('adds selected files through onChange and shows a thumbnail per file', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'salon.jpg', { type: 'image/jpeg' });
    render(<PicturesUploadField label="Photos du logement" files={[]} onChange={onChange} />);

    const input = screen.getByLabelText('Photos du logement');
    fireEvent.change(input, { target: { files: [file] } });

    expect(onChange).toHaveBeenCalledWith([file]);
  });

  it('lets the user remove a previously added file', () => {
    const onChange = vi.fn();
    const file = new File(['content'], 'salon.jpg', { type: 'image/jpeg' });
    render(<PicturesUploadField label="Photos du logement" files={[file]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retirer salon.jpg' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
