import { describe, test, expect, vi } from 'vitest';
import refresh_status from './status.ts';

global.fetch = vi.fn();

describe('status', () => {
    test('refresh_status-correct', async () => {
        const model_name = 'dummy-name';
        fetch.mockResolvedValueOnce({
            ok: true,   
            status: 200,
            json: () => {
                return{"status": "Running"};  
            }
        });
        const status = await refresh_status(model_name);
        expect(status).toEqual({"status":"Running"});
    })

    test('refresh_status-missing', async () => {
        const model_name = 'missing-name';
        fetch.mockResolvedValueOnce({
            ok: true,   
            status: 200,
            json: () => {
                return {status: "CI not started yet [ENDPOINT MISSING JSON]"};
            }
        });
        const status = await refresh_status(model_name);
        expect(status).toEqual({status: "CI not started yet [ENDPOINT MISSING JSON]"});
    })
})





 //unit test for refresh_status
 //unit test for refresh_status
//test('refresh_status returns status object', async () => {
     //Arrange
    //const model_name = 'example_model';
    //const expectedStatus = { status: 'example_status' };

     //Act
    //const result = await refresh_status(model_name);

     //Assert
    //expect(result).toEqual(expectedStatus);
//});
