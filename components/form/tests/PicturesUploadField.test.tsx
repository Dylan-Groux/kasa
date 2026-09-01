import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PicturesUploadField } from '../PicturesUploadField';

function makeFile(name: string) {
  return new File(['content'], name, { type: 'image/jpeg' });
}

describe('PicturesUploadField', () => {
  beforeEach(() => {
    let callCount = 0;
    URL.createObjectURL = vi.fn(() => `blob:mock-preview-${callCount++}`);
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds every selected file when no maxFiles is set', () => {
    const onChange = vi.fn();
    render(<PicturesUploadField label="Photos" files={[]} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Photos'), {
      target: { files: [makeFile('a.jpg'), makeFile('b.jpg')] },
    });

    expect(onChange).toHaveBeenCalledWith([expect.any(File), expect.any(File)]);
  });

  it('lets the user remove a previously added file', () => {
    const onChange = vi.fn();
    const file = makeFile('salon.jpg');
    render(<PicturesUploadField label="Photos" files={[file]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retirer salon.jpg' }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('truncates a selection that would exceed the remaining slots instead of rejecting it', () => {
    const onChange = vi.fn();
    const existing = [makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg')];
    render(
      <PicturesUploadField label="Photos" files={existing} onChange={onChange} maxFiles={4} />,
    );

    fireEvent.change(screen.getByLabelText(/Photos/), {
      target: { files: [makeFile('d.jpg'), makeFile('e.jpg')] },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [nextFiles] = onChange.mock.calls[0] as [File[]];
    expect(nextFiles).toHaveLength(4);
    expect(nextFiles.map((f) => f.name)).toEqual(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg']);
  });

  it('hides the "add" control once maxFiles is reached', () => {
    const files = [makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg'), makeFile('d.jpg')];
    render(<PicturesUploadField label="Photos" files={files} onChange={vi.fn()} maxFiles={4} />);

    expect(screen.queryByLabelText(/Photos/)).not.toBeInTheDocument();
  });

  it('shows a "current/max" hint next to the label when maxFiles is set', () => {
    render(
      <PicturesUploadField
        label="Photos"
        files={[makeFile('a.jpg')]}
        onChange={vi.fn()}
        maxFiles={4}
      />,
    );

    expect(screen.getByText('(1/4)', { exact: false })).toBeInTheDocument();
  });
});
