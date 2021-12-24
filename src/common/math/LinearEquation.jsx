// From: https://danceswithcode.net/engineeringnotes/linear_equations/linear_equations.html

export class LinearEquation {

   static solve = (matrix, constants) => {
      const det = LinearEquation.determinant(matrix)
      if (!det) {
         return [];
      }
      const one_by_det = 1.0 / det;
      const degree = matrix.length;
      let result = [];
      for (let term = 0; term < degree; term++) {
         const values_matrix = matrix.map((row, row_index) => {
            const value_row = row.map((value, col_index) => {
               return col_index === term ? constants[row_index] : value
            });
            return value_row;
         });
         result.push(LinearEquation.determinant(values_matrix) * one_by_det)
      }
      return result;
   }

   static determinant = (matrix) => {
      const degree = matrix.length;
      if (degree === 2) {
         return (
            matrix[0][0] * matrix[1][1] -
            matrix[0][1] * matrix[1][0]
         );
      }
      let sign = 1;
      let sum = 0;
      const other_rows = matrix.filter((row, index) => index !== 0);
      for (let term = 0; term < degree; term++) {
         const sub_matrix = other_rows.map((row, index) => {
            return row.filter((r, i) => i !== term)
         });
         if (matrix[0][term]) {
             sum += sign * matrix[0][term] * LinearEquation.determinant(sub_matrix);
         }
         sign *= -1;
      }
      return sum;
   }

}

export default LinearEquation;
