// From: https://danceswithcode.net/engineeringnotes/linear_equations/linear_equations.html

export class LinearEquation {

   static solve_2x2 = (matrix, constants) => {
      const a11 = matrix[0][0];
      const a12 = matrix[0][1];
      const a21 = matrix[1][0];
      const a22 = matrix[1][1];
      const k1 = constants[0];
      const k2 = constants[1];

      const det = LinearEquation.det_2x2(a11, a12, a21, a22);
      if (!det) {
         return [];
      }

      return [
         (k1 * a22 - k2 * a12) / det,
         (k2 * a11 - k1 * a21) / det
      ]
   }

   static solve_3x3 = (matrix, constants) => {
      const a11 = matrix[0][0];
      const a12 = matrix[0][1];
      const a13 = matrix[0][2];
      const a21 = matrix[1][0];
      const a22 = matrix[1][1];
      const a23 = matrix[1][2];
      const a31 = matrix[2][0];
      const a32 = matrix[2][1];
      const a33 = matrix[2][2];
      const k1 = constants[0];
      const k2 = constants[1];
      const k3 = constants[2];

      const det = LinearEquation.det_3x3(a11, a12, a13, a21, a22, a23, a31, a32, a33);
      if (!det) {
         return [];
      }

      return [
         LinearEquation.det_3x3(
            k1, a12, a13,
            k2, a22, a23,
            k3, a32, a33) / det,
         LinearEquation.det_3x3(
            a11, k1, a13,
            a21, k2, a23,
            a31, k3, a33) / det,
         LinearEquation.det_3x3(
            a11, a12, k1,
            a21, a22, k2,
            a31, a32, k3) / det
      ];
   }

   static solve_4x4 = (matrix, constants) => {
      const a11 = matrix[0][0];
      const a12 = matrix[0][1];
      const a13 = matrix[0][2];
      const a14 = matrix[0][3];
      const a21 = matrix[1][0];
      const a22 = matrix[1][1];
      const a23 = matrix[1][2];
      const a24 = matrix[1][3];
      const a31 = matrix[2][0];
      const a32 = matrix[2][1];
      const a33 = matrix[2][2];
      const a34 = matrix[2][3];
      const a41 = matrix[3][0];
      const a42 = matrix[3][1];
      const a43 = matrix[3][2];
      const a44 = matrix[3][3];
      const k1 = constants[0];
      const k2 = constants[1];
      const k3 = constants[2];
      const k4 = constants[3];

      const det = LinearEquation.det_4x4(
         a11, a12, a13, a14,
         a21, a22, a23, a24,
         a31, a32, a33, a34,
         a41, a42, a43, a44
      );
      if (!det) {
         return [];
      }

      return [
         LinearEquation.det_4x4(
            k1, a12, a13, a14,
            k2, a22, a23, a24,
            k3, a32, a33, a34,
            k4, a42, a43, a44) / det,
         LinearEquation.det_4x4(
            a11, k1, a13, a14,
            a21, k2, a23, a24,
            a31, k3, a33, a34,
            a41, k4, a43, a44) / det,
         LinearEquation.det_4x4(
            a11, a12, k1, a14,
            a21, a22, k2, a24,
            a31, a32, k3, a34,
            a41, a42, k4, a44) / det,
         LinearEquation.det_4x4(
            a11, a12, a13, k1,
            a21, a22, a23, k2,
            a31, a32, a33, k3,
            a41, a42, a43, k4,) / det,
      ];
   }

   static solve_5x5 = (matrix, constants) => {
      const a11 = matrix[0][0];
      const a12 = matrix[0][1];
      const a13 = matrix[0][2];
      const a14 = matrix[0][3];
      const a15 = matrix[0][4];
      const a21 = matrix[1][0];
      const a22 = matrix[1][1];
      const a23 = matrix[1][2];
      const a24 = matrix[1][3];
      const a25 = matrix[1][4];
      const a31 = matrix[2][0];
      const a32 = matrix[2][1];
      const a33 = matrix[2][2];
      const a34 = matrix[2][3];
      const a35 = matrix[2][4];
      const a41 = matrix[3][0];
      const a42 = matrix[3][1];
      const a43 = matrix[3][2];
      const a44 = matrix[3][3];
      const a45 = matrix[3][4];
      const a51 = matrix[4][0];
      const a52 = matrix[4][1];
      const a53 = matrix[4][2];
      const a54 = matrix[4][3];
      const a55 = matrix[4][4];
      const k1 = constants[0];
      const k2 = constants[1];
      const k3 = constants[2];
      const k4 = constants[3];
      const k5 = constants[4];

      const det = LinearEquation.det_5x5(
         a11, a12, a13, a14, a15,
         a21, a22, a23, a24, a25,
         a31, a32, a33, a34, a35,
         a41, a42, a43, a44, a45,
         a51, a52, a53, a54, a55,
      );
      if (!det) {
         return [];
      }

      return [
         LinearEquation.det_5x5(
            k1, a12, a13, a14, a15,
            k2, a22, a23, a24, a25,
            k3, a32, a33, a34, a35,
            k4, a42, a43, a44, a45,
            k5, a52, a53, a54, a55) / det,
         LinearEquation.det_5x5(
            a11, k1, a13, a14, a15,
            a21, k2, a23, a24, a25,
            a31, k3, a33, a34, a35,
            a41, k4, a43, a44, a45,
            a51, k5, a53, a54, a55) / det,
         LinearEquation.det_5x5(
            a11, a12, k1, a14, a15,
            a21, a22, k2, a24, a25,
            a31, a32, k3, a34, a35,
            a41, a42, k4, a44, a45,
            a51, a52, k5, a54, a55) / det,
         LinearEquation.det_5x5(
            a11, a12, a13, k1, a15,
            a21, a22, a23, k2, a25,
            a31, a32, a33, k3, a35,
            a41, a42, a43, k4, a45,
            a51, a52, a53, k5, a55) / det,
         LinearEquation.det_5x5(
            a11, a12, a13, a14, k1,
            a21, a22, a23, a24, k2,
            a31, a32, a33, a34, k3,
            a41, a42, a43, a44, k4,
            a51, a52, a53, a54, k5) / det,
      ];
   }

   static solve_6x6 = (matrix, constants) => {
      const a11 = matrix[0][0];
      const a12 = matrix[0][1];
      const a13 = matrix[0][2];
      const a14 = matrix[0][3];
      const a15 = matrix[0][4];
      const a16 = matrix[0][5];
      const a21 = matrix[1][0];
      const a22 = matrix[1][1];
      const a23 = matrix[1][2];
      const a24 = matrix[1][3];
      const a25 = matrix[1][4];
      const a26 = matrix[1][5];
      const a31 = matrix[2][0];
      const a32 = matrix[2][1];
      const a33 = matrix[2][2];
      const a34 = matrix[2][3];
      const a35 = matrix[2][4];
      const a36 = matrix[2][5];
      const a41 = matrix[3][0];
      const a42 = matrix[3][1];
      const a43 = matrix[3][2];
      const a44 = matrix[3][3];
      const a45 = matrix[3][4];
      const a46 = matrix[3][5];
      const a51 = matrix[4][0];
      const a52 = matrix[4][1];
      const a53 = matrix[4][2];
      const a54 = matrix[4][3];
      const a55 = matrix[4][4];
      const a56 = matrix[4][5];
      const a61 = matrix[5][0];
      const a62 = matrix[5][1];
      const a63 = matrix[5][2];
      const a64 = matrix[5][3];
      const a65 = matrix[5][4];
      const a66 = matrix[5][5];
      const k1 = constants[0];
      const k2 = constants[1];
      const k3 = constants[2];
      const k4 = constants[3];
      const k5 = constants[4];
      const k6 = constants[5];

      const det = LinearEquation.det_6x6(
         a11, a12, a13, a14, a15, a16,
         a21, a22, a23, a24, a25, a26,
         a31, a32, a33, a34, a35, a36,
         a41, a42, a43, a44, a45, a46,
         a51, a52, a53, a54, a55, a56,
         a61, a62, a63, a64, a65, a66
      );
      if (!det) {
         return [];
      }

      return [
         LinearEquation.det_6x6(
            k1, a12, a13, a14, a15, a16,
            k2, a22, a23, a24, a25, a26,
            k3, a32, a33, a34, a35, a36,
            k4, a42, a43, a44, a45, a46,
            k5, a52, a53, a54, a55, a56,
            k6, a62, a63, a64, a65, a66) / det,
         LinearEquation.det_6x6(
            a11, k1, a13, a14, a15, a16,
            a21, k2, a23, a24, a25, a26,
            a31, k3, a33, a34, a35, a36,
            a41, k4, a43, a44, a45, a46,
            a51, k5, a53, a54, a55, a56,
            a61, k6, a63, a64, a65, a66) / det,
         LinearEquation.det_6x6(
            a11, a12, k1, a14, a15, a16,
            a21, a22, k2, a24, a25, a26,
            a31, a32, k3, a34, a35, a36,
            a41, a42, k4, a44, a45, a46,
            a51, a52, k5, a54, a55, a56,
            a61, a62, k6, a64, a65, a66) / det,
         LinearEquation.det_6x6(
            a11, a12, a13, k1, a15, a16,
            a21, a22, a23, k2, a25, a26,
            a31, a32, a33, k3, a35, a36,
            a41, a42, a43, k4, a45, a46,
            a51, a52, a53, k5, a55, a56,
            a61, a62, a63, k6, a65, a66) / det,
         LinearEquation.det_6x6(
            a11, a12, a13, a14, k1, a16,
            a21, a22, a23, a24, k2, a26,
            a31, a32, a33, a34, k3, a36,
            a41, a42, a43, a44, k4, a46,
            a51, a52, a53, a54, k5, a56,
            a61, a62, a63, a64, k6, a66) / det,
         LinearEquation.det_6x6(
            a11, a12, a13, a14, a15, k1,
            a21, a22, a23, a24, a25, k2,
            a31, a32, a33, a34, a35, k3,
            a41, a42, a43, a44, a45, k4,
            a51, a52, a53, a54, a55, k5,
            a61, a62, a63, a64, a65, k6) / det
      ];
   }

    static solve_7x7 = (matrix, constants) => {
        const a11 = matrix[0][0];
        const a12 = matrix[0][1];
        const a13 = matrix[0][2];
        const a14 = matrix[0][3];
        const a15 = matrix[0][4];
        const a16 = matrix[0][5];
        const a17 = matrix[0][6];
        const a21 = matrix[1][0];
        const a22 = matrix[1][1];
        const a23 = matrix[1][2];
        const a24 = matrix[1][3];
        const a25 = matrix[1][4];
        const a26 = matrix[1][5];
        const a27 = matrix[1][6];
        const a31 = matrix[2][0];
        const a32 = matrix[2][1];
        const a33 = matrix[2][2];
        const a34 = matrix[2][3];
        const a35 = matrix[2][4];
        const a36 = matrix[2][5];
        const a37 = matrix[2][6];
        const a41 = matrix[3][0];
        const a42 = matrix[3][1];
        const a43 = matrix[3][2];
        const a44 = matrix[3][3];
        const a45 = matrix[3][4];
        const a46 = matrix[3][5];
        const a47 = matrix[3][6];
        const a51 = matrix[4][0];
        const a52 = matrix[4][1];
        const a53 = matrix[4][2];
        const a54 = matrix[4][3];
        const a55 = matrix[4][4];
        const a56 = matrix[4][5];
        const a57 = matrix[4][6];
        const a61 = matrix[5][0];
        const a62 = matrix[5][1];
        const a63 = matrix[5][2];
        const a64 = matrix[5][3];
        const a65 = matrix[5][4];
        const a66 = matrix[5][5];
        const a67 = matrix[5][6];
        const a71 = matrix[6][0];
        const a72 = matrix[6][1];
        const a73 = matrix[6][2];
        const a74 = matrix[6][3];
        const a75 = matrix[6][4];
        const a76 = matrix[6][5];
        const a77 = matrix[6][6];
        const k1 = constants[0];
        const k2 = constants[1];
        const k3 = constants[2];
        const k4 = constants[3];
        const k5 = constants[4];
        const k6 = constants[5];
        const k7 = constants[6];

        const det = LinearEquation.det_7x7(
           a11, a12, a13, a14, a15, a16, a17,
           a21, a22, a23, a24, a25, a26, a27,
           a31, a32, a33, a34, a35, a36, a37,
           a41, a42, a43, a44, a45, a46, a47,
           a51, a52, a53, a54, a55, a56, a57,
           a61, a62, a63, a64, a65, a66, a67,
           a71, a72, a73, a74, a75, a76, a77
        );
        if (!det) {
            return [];
        }

        return [
            LinearEquation.det_7x7(
               k1, a12, a13, a14, a15, a16, a17,
               k2, a22, a23, a24, a25, a26, a27,
               k3, a32, a33, a34, a35, a36, a37,
               k4, a42, a43, a44, a45, a46, a47,
               k5, a52, a53, a54, a55, a56, a57,
               k6, a62, a63, a64, a65, a66, a67,
               k7, a72, a73, a74, a75, a76, a77) / det,
            LinearEquation.det_7x7(
               a11, k1, a13, a14, a15, a16, a17,
               a21, k2, a23, a24, a25, a26, a27,
               a31, k3, a33, a34, a35, a36, a37,
               a41, k4, a43, a44, a45, a46, a47,
               a51, k5, a53, a54, a55, a56, a57,
               a61, k6, a63, a64, a65, a66, a67,
               a71, k7, a73, a74, a75, a76, a77) / det,
            LinearEquation.det_7x7(
               a11, a12, k1, a14, a15, a16, a17,
               a21, a22, k2, a24, a25, a26, a27,
               a31, a32, k3, a34, a35, a36, a37,
               a41, a42, k4, a44, a45, a46, a47,
               a51, a52, k5, a54, a55, a56, a57,
               a61, a62, k6, a64, a65, a66, a67,
               a71, a72, k7, a74, a75, a76, a77) / det,
            LinearEquation.det_7x7(
               a11, a12, a13, k1, a15, a16, a17,
               a21, a22, a23, k2, a25, a26, a27,
               a31, a32, a33, k3, a35, a36, a37,
               a41, a42, a43, k4, a45, a46, a47,
               a51, a52, a53, k5, a55, a56, a57,
               a61, a62, a63, k6, a65, a66, a67,
               a71, a72, a73, k7, a75, a76, a77) / det,
            LinearEquation.det_7x7(
               a11, a12, a13, a14, k1, a16, a17,
               a21, a22, a23, a24, k2, a26, a27,
               a31, a32, a33, a34, k3, a36, a37,
               a41, a42, a43, a44, k4, a46, a47,
               a51, a52, a53, a54, k5, a56, a57,
               a61, a62, a63, a64, k6, a66, a67,
               a71, a72, a73, a74, k7, a76, a77) / det,
            LinearEquation.det_7x7(
               a11, a12, a13, a14, a15, k1, a17,
               a21, a22, a23, a24, a25, k2, a27,
               a31, a32, a33, a34, a35, k3, a37,
               a41, a42, a43, a44, a45, k4, a47,
               a51, a52, a53, a54, a55, k5, a57,
               a61, a62, a63, a64, a65, k6, a67,
               a71, a72, a73, a74, a75, k7, a77) / det,
            LinearEquation.det_7x7(
               a11, a12, a13, a14, a15, a16, k1,
               a21, a22, a23, a24, a25, a26, k2,
               a31, a32, a33, a34, a35, a36, k3,
               a41, a42, a43, a44, a45, a46, k4,
               a51, a52, a53, a54, a55, a56, k5,
               a61, a62, a63, a64, a65, a66, k6,
               a71, a72, a73, a74, a75, a76, k7) / det
        ];
    }

   static det_2x2 = (
      a11, a12,
      a21, a22
   ) => {
      return (
         a11 * a22 -
         a12 * a21
      );
   }

   static det_3x3 = (
      a11, a12, a13,
      a21, a22, a23,
      a31, a32, a33
   ) => {
      return (
         a11 * a22 * a33 +
         a12 * a23 * a31 +
         a13 * a21 * a32 -
         a13 * a22 * a31 -
         a12 * a21 * a33 -
         a11 * a23 * a32
      );
   }

   static det_4x4 = (
      a11, a12, a13, a14,
      a21, a22, a23, a24,
      a31, a32, a33, a34,
      a41, a42, a43, a44
   ) => {
      return (
         a11 * LinearEquation.det_3x3(
            a22, a23, a24,
            a32, a33, a34,
            a42, a43, a44) -
         a12 * LinearEquation.det_3x3(
            a21, a23, a24,
            a31, a33, a34,
            a41, a43, a44) +
         a13 * LinearEquation.det_3x3(
            a21, a22, a24,
            a31, a32, a34,
            a41, a42, a44) -
         a14 * LinearEquation.det_3x3(
            a21, a22, a23,
            a31, a32, a33,
            a41, a42, a43)
      );
   }

   static det_5x5 = (
      a11, a12, a13, a14, a15,
      a21, a22, a23, a24, a25,
      a31, a32, a33, a34, a35,
      a41, a42, a43, a44, a45,
      a51, a52, a53, a54, a55
   ) => {
      return (
         a11 * LinearEquation.det_4x4(
            a22, a23, a24, a25,
            a32, a33, a34, a35,
            a42, a43, a44, a45,
            a52, a53, a54, a55) -
         a12 * LinearEquation.det_4x4(
            a21, a23, a24, a25,
            a31, a33, a34, a35,
            a41, a43, a44, a45,
            a51, a53, a54, a55) +
         a13 * LinearEquation.det_4x4(
            a21, a22, a24, a25,
            a31, a32, a34, a35,
            a41, a42, a44, a45,
            a51, a52, a54, a55) -
         a14 * LinearEquation.det_4x4(
            a21, a22, a23, a25,
            a31, a32, a33, a35,
            a41, a42, a43, a45,
            a51, a52, a53, a55) +
         a15 * LinearEquation.det_4x4(
            a21, a22, a23, a24,
            a31, a32, a33, a34,
            a41, a42, a43, a44,
            a51, a52, a53, a54)
      );
   }

   static det_6x6 = (
      a11, a12, a13, a14, a15, a16,
      a21, a22, a23, a24, a25, a26,
      a31, a32, a33, a34, a35, a36,
      a41, a42, a43, a44, a45, a46,
      a51, a52, a53, a54, a55, a56,
      a61, a62, a63, a64, a65, a66
   ) => {
      return (
         a11 * LinearEquation.det_5x5(
            a22, a23, a24, a25, a26,
            a32, a33, a34, a35, a36,
            a42, a43, a44, a45, a46,
            a52, a53, a54, a55, a56,
            a62, a63, a64, a65, a66) -
         a12 * LinearEquation.det_5x5(
            a21, a23, a24, a25, a26,
            a31, a33, a34, a35, a36,
            a41, a43, a44, a45, a46,
            a51, a53, a54, a55, a56,
            a61, a63, a64, a65, a66) +
         a13 * LinearEquation.det_5x5(
            a21, a22, a24, a25, a26,
            a31, a32, a34, a35, a36,
            a41, a42, a44, a45, a46,
            a51, a52, a54, a55, a56,
            a61, a62, a64, a65, a66) -
         a14 * LinearEquation.det_5x5(
            a21, a22, a23, a25, a26,
            a31, a32, a33, a35, a36,
            a41, a42, a43, a45, a46,
            a51, a52, a53, a55, a56,
            a61, a62, a63, a65, a66) +
         a15 * LinearEquation.det_5x5(
            a21, a22, a23, a24, a26,
            a31, a32, a33, a34, a36,
            a41, a42, a43, a44, a46,
            a51, a52, a53, a54, a56,
            a61, a62, a63, a64, a66) -
         a16 * LinearEquation.det_5x5(
            a21, a22, a23, a24, a25,
            a31, a32, a33, a34, a35,
            a41, a42, a43, a44, a45,
            a51, a52, a53, a54, a55,
            a61, a62, a63, a64, a65)
      );
   }

   static det_7x7 = (
      a11, a12, a13, a14, a15, a16, a17,
      a21, a22, a23, a24, a25, a26, a27,
      a31, a32, a33, a34, a35, a36, a37,
      a41, a42, a43, a44, a45, a46, a47,
      a51, a52, a53, a54, a55, a56, a57,
      a61, a62, a63, a64, a65, a66, a67,
      a71, a72, a73, a74, a75, a76, a77,
   ) => {
      return (
         a11 * LinearEquation.det_6x6(
            a22, a23, a24, a25, a26, a27,
            a32, a33, a34, a35, a36, a37,
            a42, a43, a44, a45, a46, a47,
            a52, a53, a54, a55, a56, a57,
            a62, a63, a64, a65, a66, a67,
            a72, a73, a74, a75, a76, a77) -
         a12 * LinearEquation.det_6x6(
            a21, a23, a24, a25, a26, a27,
            a31, a33, a34, a35, a36, a37,
            a41, a43, a44, a45, a46, a47,
            a51, a53, a54, a55, a56, a57,
            a61, a63, a64, a65, a66, a67,
            a71, a73, a74, a75, a76, a77) +
         a13 * LinearEquation.det_6x6(
            a21, a22, a24, a25, a26, a27,
            a31, a32, a34, a35, a36, a37,
            a41, a42, a44, a45, a46, a47,
            a51, a52, a54, a55, a56, a57,
            a61, a62, a64, a65, a66, a67,
            a71, a72, a74, a75, a76, a77) -
         a14 * LinearEquation.det_6x6(
            a21, a22, a23, a25, a26, a27,
            a31, a32, a33, a35, a36, a37,
            a41, a42, a43, a45, a46, a47,
            a51, a52, a53, a55, a56, a57,
            a61, a62, a63, a65, a66, a67,
            a71, a72, a73, a75, a76, a77) +
         a15 * LinearEquation.det_6x6(
            a21, a22, a23, a24, a26, a27,
            a31, a32, a33, a34, a36, a37,
            a41, a42, a43, a44, a46, a47,
            a51, a52, a53, a54, a56, a57,
            a61, a62, a63, a64, a66, a67,
            a71, a72, a73, a74, a76, a77) -
         a16 * LinearEquation.det_6x6(
            a21, a22, a23, a24, a25, a27,
            a31, a32, a33, a34, a35, a37,
            a41, a42, a43, a44, a45, a47,
            a51, a52, a53, a54, a55, a57,
            a61, a62, a63, a64, a65, a67,
            a71, a72, a73, a74, a75, a77) +
         a17 * LinearEquation.det_6x6(
            a21, a22, a23, a24, a25, a26,
            a31, a32, a33, a34, a35, a36,
            a41, a42, a43, a44, a45, a46,
            a51, a52, a53, a54, a55, a56,
            a61, a62, a63, a64, a65, a66,
            a71, a72, a73, a74, a75, a76)
      );
   }
}

export default LinearEquation;
