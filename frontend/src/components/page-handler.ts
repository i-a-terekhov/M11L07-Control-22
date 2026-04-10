// Абстрактный класс для всех обработчиков страниц, чтобы можно было бы задать единый тип для currentPageInstance в router.ts
export abstract class PageHandler {
    public destroy(): void {}
}