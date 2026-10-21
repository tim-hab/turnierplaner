import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function createScoreValidator(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const teamA = form.value['teamA'];
    const teamB = form.value['teamB'];

    if (!teamA || !teamB) return null;

    if (typeof teamA == 'string' && typeof teamB == 'string') {
      const values = [Number(teamA), Number(teamB)] as number[];
      if (values[0] < 21 && values[1] < 21) {
        return {
          error:
            'Das Spiel ist erst dann zu Ende, wenn ein Team 21 oder mehr Punkte und das andere Team min. 2 Punkte weniger hat.',
        };
      } else if (values[0] == values[1]) {
        return { error: 'Punkte müssen unterschiedlich sein' };
      } else if (values[0] >= 21 || values[1] >= 21) {
        if (values[0] <= 19 || values[1] <= 19) return null;
        else if (Math.abs(values[0] - values[1]) != 2)
          return {
            error:
              'Die Sieger müssen min. 2 Punkte mehr haben als die Verlierer. Haben die Sieger mehr als 21 Punkte, dürfen es nicht mehr als 2 Punkte Unterschied sein',
          };
      }
      return null;
    } else {
      return { error: 'Es dürfen nur Zeahlen eingegeben werden' };
    }
  };
}
