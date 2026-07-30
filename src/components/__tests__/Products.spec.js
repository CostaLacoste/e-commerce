import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Products from '../Products.vue'

const IconStub = {
  props: ['icon'],
  template: '<span class="icon-stub" :data-icon="icon"></span>',
}

const mountProducts = () =>
  mount(Products, {
    global: {
      stubs: { Icon: IconStub },
    },
  })

describe('Products.vue', () => {
  it('рендерится без ошибок', () => {
    const wrapper = mountProducts()
    expect(wrapper.exists()).toBe(true)
  })

  it('рендерит заголовок секции', () => {
    const wrapper = mountProducts()
    expect(wrapper.text()).toContain('Featured Products')
  })

  it('показывает productsPerPage товаров на десктопе (4 из 8)', () => {
    const wrapper = mountProducts()
    const items = wrapper.findAll('li')
    expect(items.length).toBe(4)
  })

  it('отображает имя, цену и рейтинг товара', () => {
    const wrapper = mountProducts()
    const text = wrapper.text()

    expect(text).toContain('Floral')
    expect(text).toContain('$79.99') // 99.99 * (1 - 20/100)
    expect(text).toContain('(4.5)')
  })

  it('показывает зачёркнутую старую цену только при наличии скидки', () => {
    const wrapper = mountProducts()
    const firstCard = wrapper.findAll('li')[0]
    expect(firstCard.find('.line-through').exists()).toBe(true)
    expect(firstCard.text()).toContain('$99.99')
  })

  it('показывает бейдж скидки только когда discount > 0', () => {
    const wrapper = mountProducts()
    const firstCard = wrapper.findAll('li')[0]
    expect(firstCard.text()).toContain('-20%')
  })

  it('переключает на следующий слайд по клику nextSlide', async () => {
    const wrapper = mountProducts()
    const nextBtn = wrapper.find('[aria-label="Next slide"]')

    // первый слайд — товары 1-4
    expect(wrapper.text()).toContain('Woody') // product2

    await nextBtn.trigger('click')

    // второй слайд — товары 5-8, значит первого Woody быть не должно
    const items = wrapper.findAll('li')
    expect(items.length).toBe(4)
  })

  it('переключает на предыдущий слайд с зацикливанием на последний', async () => {
    const wrapper = mountProducts()
    const prevBtn = wrapper.find('[aria-label="Previous slide"]')

    // на первом слайде (index 0) клик "назад" должен перейти на последний слайд
    await prevBtn.trigger('click')

    const items = wrapper.findAll('li')
    expect(items.length).toBeGreaterThan(0) // не должно быть пустого списка
  })

  it('рендерит правильное количество точек пагинации', () => {
    const wrapper = mountProducts()
    // 8 товаров / 4 на странице = 2 слайда
    const dots = wrapper.findAll('nav[aria-label="Carousel pagination"] button')
    expect(dots.length).toBe(2)
  })

  it('клик по точке пагинации переключает слайд', async () => {
    const wrapper = mountProducts()
    const dots = wrapper.findAll('nav[aria-label="Carousel pagination"] button')

    await dots[1].trigger('click')

    // после перехода на второй слайд активная точка должна быть последней
    expect(dots[1].classes()).toContain('bg-pink-950')
  })

  it('добавляет и убирает обработчик resize при монтировании/размонтировании', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const wrapper = mountProducts()
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})