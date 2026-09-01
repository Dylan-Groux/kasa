import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextField } from '../TextField';

describe('TextField', () => {
  it('starts empty when neither value nor defaultValue is given', () => {
    render(<TextField label="Nom" name="name" />);

    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('preloads defaultValue as an uncontrolled initial value', () => {
    render(<TextField label="Nom" name="name" defaultValue="Jean Dupont" />);

    expect(screen.getByLabelText('Nom')).toHaveValue('Jean Dupont');
  });

  it('renders as controlled when value is given, ignoring defaultValue', () => {
    render(<TextField label="Nom" name="name" value="Alex" defaultValue="Jean Dupont" />);

    expect(screen.getByLabelText('Nom')).toHaveValue('Alex');
  });
});
