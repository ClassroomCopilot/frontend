import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WrappedApp, App } from '../src/App';

describe('App', () => {
    it('Renders hello world', () => {
        //  ARRANGE
        render(<WrappedApp />);
        //  ACT
        //  EXPECT
        expect(
            screen.getByRole('heading', {
                level: 1,
            }
        )).toHaveTextContent('Hello World')
    });
    it('Renders not found if invalid path', () => {
        //  ARRANGE
        render(
            <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
                <App />
            </MemoryRouter>
        );
        //  ACT
        //  EXPECT
        expect(
            screen.getByRole('heading', {
                level: 1,
            }
        )).toHaveTextContent('Not Found')
    });
});