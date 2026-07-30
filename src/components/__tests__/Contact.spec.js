import Contact from "../Contact.vue";
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

const mountContact = () =>
  mount(Contact, {
    global: {
      stubs: { Icon: true },
    },
  })

describe('Contact.vue', () => {
  it('рендерит заголовок формы', () => {
    const wrapper = mount(Contact)
    expect(wrapper.text()).toContain('Send Us a Message')
  })

  it('обновляет поле имени при вводе', async () => {
    const wrapper = mount(Contact)
    const input = wrapper.find('#name')
    await input.setValue('Богдан')
    expect(input.element.value).toBe('Богдан')
  })

  it('отображает все обязательные поля', () => {
    const wrapper = mount(Contact)
    expect(wrapper.find('#name').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#message').exists()).toBe(true)
  })
})