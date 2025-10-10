import * as functions from "./main";
Object.assign(globalThis, functions);

describe("Function Tests", () => {
    it("Should capitalize string", () => {
        expect(capitalize("john")).toBe("John");
        expect(capitalize("ivan")).toBe("Ivan");
        expect(capitalize("")).toBe("");
        expect(capitalize("11")).toBe("11");
    });

    it("Should reverse string", () => {
        expect(reverseString("john")).toBe("nhoj");
        expect(reverseString("ivan")).toBe("navi");
        expect(reverseString("")).toBe("");
        expect(reverseString("13")).toBe("31");
    });

    it("Should add properly", () => {
        expect(calculator.add(5, 3)).toBe(8);
        expect(calculator.add(0, 3)).toBe(3);
    });

    it("Should subtract properly", () => {
        expect(calculator.subtract(5, 3)).toBe(2);
        expect(calculator.subtract(-1, -3)).toBe(2);
    });

    it("Should mutliply properly", () => {
        expect(calculator.multiply(5, 3)).toBe(15);
        expect(calculator.multiply(-1, -3)).toBe(3);
    });

    it("Should divide properly", () => {
        expect(calculator.divide(5, 2)).toBe(2.5);
        expect(calculator.divide(3, 0)).toBe(Infinity);
    });

    it("Should decrypt properly", () => {
        expect(ceasarCipher("Hello, World!", 3)).toBe("Khoor, Zruog!");
        expect(ceasarCipher("xyz", 3)).toBe("abc");
        expect(ceasarCipher("xyz", -3)).toBe("uvw");
        expect(ceasarCipher("HeLLo", 3)).toBe("KhOOr");
        expect(ceasarCipher("HeLLo", -3)).toBe("EbIIl");
    });

    it("Should analyze array properly", () => {
        let obj = analyzeArray([1, 2, 3, 4]);

        expect(obj.average).toBe(2.5);
        expect(obj.min).toBe(1);
        expect(obj.max).toBe(4);
        expect(obj.length).toBe(4);

        obj = analyzeArray([1, 8, 3, 4, 2, 6]);

        expect(obj.average).toBe(4);
        expect(obj.min).toBe(1);
        expect(obj.max).toBe(8);
        expect(obj.length).toBe(6);
    });


});