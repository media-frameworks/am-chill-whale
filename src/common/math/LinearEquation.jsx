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
}

export default LinearEquation;
