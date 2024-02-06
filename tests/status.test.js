import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import Status from '../src/components/Status.svelte';


describe('Status.svelte', () => {
    // TODO: @testing-library/svelte claims to add this automatically but it doesn't work without explicit afterEach
    afterEach(() => cleanup())

    test('mounts', () => {
        const { container } = render(Status, {})
        expect(container).toBeTruthy()
        expect(container.innerHTML).toContain('<input')
        expect(container.innerHTML).toMatchSnapshot()
    })

    test('input-works', async () => {
        render(Status, { count: 4 })
        const input = screen.getByRole('textbox')
        await fireEvent.change(input, { target: { value: 'some-name' } })
        const submit = screen.getByRole('button')
        await fireEvent.click(submit) 

        //await fireEvent.click(btn)
        //expect(div.innerHTML).toBe('4 x 3 = 12')
        //await fireEvent.click(btn)
        //expect(div.innerHTML).toBe('4 x 4 = 16')
  })
})
