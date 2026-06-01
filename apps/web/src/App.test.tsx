import { render, screen } from '@testing-library/react';

import { App } from './App';

describe('App', () => {
  it('renders the dashboard shell', async () => {
    render(<App />);

    expect(
      await screen.findByText('Your spending, simplified'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Alex Rivera')).toBeInTheDocument();
  });
});
