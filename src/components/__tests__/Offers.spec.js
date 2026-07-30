// src/components/__tests__/Offers.spec.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Offers from '../Offers.vue'

const IconStub = {
  props: ['icon'],
  template: '<span class="icon-stub" :data-icon="icon"></span>',
}

const mountOffers = () =>
  mount(Offers, {
    global: {
      stubs: { Icon: IconStub },
    },
  })

describe('Offers.vue', () => {
  it('рендерится без ошибок', () => {
    const wrapper = mountOffers()
    expect(wrapper.exists()).toBe(true)
  })

  it('рендерит заголовок и подзаголовок секции', () => {
    const wrapper = mountOffers()
    expect(wrapper.text()).toContain('Special Offers')
    expect(wrapper.text()).toContain('Take advantage of these limited-time offers')
  })

  it('рендерит все 3 оффера из currentOffers', () => {
    const wrapper = mountOffers()
    const cards = wrapper.findAll('.grid > div')
    expect(cards.length).toBe(3)
  })

  it('отображает заголовок, описание, код и дату для каждого оффера', () => {
    const wrapper = mountOffers()
    const text = wrapper.text()

    expect(text).toContain('Hot Summer Sale')
    expect(text).toContain('SUMMER30')
    expect(text).toContain('Free perfume offer')
    expect(text).toContain('FREEPERFUME')
    expect(text).toContain('New Launch Discount')
    expect(text).toContain('NEW20')
    expect(text).toContain('2026-08-31')
  })

  it('рендерит 3 кнопки "Claim offer"', () => {
    const wrapper = mountOffers()
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBe(3)
    buttons.forEach((btn) => {
      expect(btn.text()).toBe('Claim offer')
    })
  })

  it('применяет правильные классы фона и текста для каждой карточки', () => {
    const wrapper = mountOffers()
    const cards = wrapper.findAll('.grid > div')

    expect(cards[0].classes()).toContain('bg-amber-200')
    expect(cards[1].classes()).toContain('bg-purple-200')
    expect(cards[2].classes()).toContain('bg-pink-200')
  })
})

describe('Offers.vue — логика иконки скидки', () => {
  it('выбирает иконку percent для офферов со знаком % в discount', () => {
    const wrapper = mountOffers()

    // офферы 1 и 3 (id: 1, id: 3) имеют discount '30%' и '20%'
    const cards = wrapper.findAll('.grid > div')
    const firstCardIcon = cards[0].find('[data-icon]')
    const thirdCardIcon = cards[2].find('[data-icon]')

    expect(firstCardIcon.attributes('data-icon')).toBe('material-symbols:percent')
    expect(thirdCardIcon.attributes('data-icon')).toBe('material-symbols:percent')
  })

  it('выбирает иконку gift для оффера без % в discount', () => {
    const wrapper = mountOffers()

    // оффер 2 имеет discount 'Gift'
    const cards = wrapper.findAll('.grid > div')
    const secondCardIcon = cards[1].find('[data-icon]')

    expect(secondCardIcon.attributes('data-icon')).toBe('mdi:gift')
  })
})