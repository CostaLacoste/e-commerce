import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '../Footer.vue'

const mountFooter = () =>
  mount(Footer, {
    global: {
      stubs: {
        Icon: true, 
      },
    },
  })

describe('Footer.vue', () => {
  it('рендерится без ошибок', () => {
    const wrapper = mountFooter()
    expect(wrapper.exists()).toBe(true)
  })

  it('отображает название бренда и описание', () => {
    const wrapper = mountFooter()
    expect(wrapper.text()).toContain('Scent Haven')
    expect(wrapper.text()).toContain('luxury fragrances')
  })

  it('отображает все социальные ссылки', () => {
    const wrapper = mountFooter()
    const socialLinks = wrapper.findAll('.flex.space-x-4 a')
    expect(socialLinks.length).toBe(3)
  })

  it('отображает все Quick Links пункты', () => {
    const wrapper = mountFooter()
    const items = ['Home', 'Shop', 'New Arrivals', 'Best Sellers', 'Gift Sets']
    items.forEach((item) => {
      expect(wrapper.text()).toContain(item)
    })
  })

  it('отображает все пункты Customer Service', () => {
    const wrapper = mountFooter()
    const items = ['Contact Us', 'FAQs', 'Shipping Policy', 'Return & Exchanges', 'Privacy Policy']
    items.forEach((item) => {
      expect(wrapper.text()).toContain(item)
    })
  })

  it('содержит форму подписки с email input и кнопкой Subscribe', () => {
    const wrapper = mountFooter()
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)
    expect(emailInput.attributes('required')).toBeDefined()
    expect(wrapper.find('button[type="submit"]').text()).toBe('Subscribe')
  })

  it('отображает email поддержки', () => {
    const wrapper = mountFooter()
    expect(wrapper.text()).toContain('support@scenthaven.com')
  })

  it('отображает текущий год в копирайте', () => {
    const wrapper = mountFooter()
    const currentYear = new Date().getFullYear().toString()
    expect(wrapper.text()).toContain(currentYear)
    expect(wrapper.text()).toContain('Scent Haven')
  })

  it('отображает иконки платёжных систем', () => {
    const wrapper = mountFooter()
    const paymentIconsContainer = wrapper.findAll('.flex.space-x-6 icon-stub')
    expect(paymentIconsContainer.length).toBe(3)
  })

  it('позволяет ввести email в поле подписки', async () => {
    const wrapper = mountFooter()
    const input = wrapper.find('input[type="email"]')
    await input.setValue('test@example.com')
    expect(input.element.value).toBe('test@example.com')
  })
})