import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Remark } from '../src';

describe('Remark', () => {
  it('should render content', async () => {
    const { container, getByText } = render(<Remark># header</Remark>);
    await waitFor(() => {
      expect(getByText('header')).toBeInTheDocument();
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
