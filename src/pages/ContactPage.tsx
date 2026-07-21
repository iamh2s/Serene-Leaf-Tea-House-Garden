import { useState } from 'react';
import { MapPin, Clock, Phone, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import * as api from '../services/api';
import toast from 'react-hot-toast';

const info = [
  { icon: MapPin, title: 'Location', lines: ['142 Willow Creek Lane', 'Portland, OR 97201'] },
  { icon: Clock, title: 'Hours', lines: ['Mon – Fri: 7:00 AM – 8:00 PM', 'Sat – Sun: 8:00 AM – 9:00 PM'] },
  { icon: Phone, title: 'Phone', lines: ['(503) 555-0142'] },
  { icon: Mail, title: 'Email', lines: ['hello@sereneleaf.com'] },
];

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof ContactForm, string>>;

// ===== VALIDATION HELPERS =====
const validators = {
  name: (val: string): string => {
    if (!val.trim()) return 'Name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name should only contain letters';
    return '';
  },
  email: (val: string): string => {
    if (!val.trim()) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val.trim())) return 'Enter a valid email (e.g. name@example.com)';
    return '';
  },
  phone: (val: string): string => {
    if (!val.trim()) return 'Phone number is required';
    if (!/^\d+$/.test(val)) return 'Phone must contain only digits';
    if (val.length !== 10) return 'Phone must be exactly 10 digits';
    if (!/^[6-9]/.test(val)) return 'Phone must start with 6, 7, 8, or 9';
    return '';
  },
  subject: (val: string): string => {
    if (val && val.length > 100) return 'Subject too long (max 100 chars)';
    return '';
  },
  message: (val: string): string => {
    if (!val.trim()) return 'Message is required';
    if (val.trim().length < 10) return 'Message must be at least 10 characters';
    if (val.trim().length > 1000) return 'Message too long (max 1000 chars)';
    return '';
  },
};

// ===== INPUT FILTERS (block invalid characters) =====
const filterInput = (field: keyof ContactForm, value: string): string => {
  switch (field) {
    case 'name':
      return value.replace(/[^a-zA-Z\s]/g, '');
    case 'phone':
      return value.replace(/\D/g, '').slice(0, 10);
    case 'email':
      return value.replace(/\s/g, '');
    default:
      return value;
  }
};

export default function ContactPage() {
  const { ref, isVisible } = useScrollReveal();
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ContactForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as keyof ContactForm;
    const filtered = filterInput(field, e.target.value);

    setForm((prev) => ({ ...prev, [field]: filtered }));

    if (touched[field]) {
      const errorMsg = validators[field](filtered);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as keyof ContactForm;
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validators[field](form[field]);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    const allTouched: Partial<Record<keyof ContactForm, boolean>> = {};

    (Object.keys(form) as Array<keyof ContactForm>).forEach((field) => {
      const err = validators[field](form[field]);
      if (err) newErrors[field] = err;
      allTouched[field] = true;
    });

    setErrors(newErrors);
    setTouched(allTouched);

    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form', { id: 'form-err' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!validateAll()) return;

    setLoading(true);

    try {
      await api.sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSubmitted(true);
      toast.success('Message sent successfully! 🎉', { id: 'msg-sent' });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setErrors({});
      setTouched({});
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error('Contact message failed:', error);
      toast.error(api.getApiErrorMessage(error), { id: 'msg-error' });
    } finally {
      setLoading(false);
    }
  };

  // Helper for input styling based on validation state
  const getInputClass = (field: keyof ContactForm) => {
    const baseClass =
      'w-full px-4 py-3 rounded-xl border bg-tea-50/50 text-tea-900 placeholder:text-tea-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors';

    if (errors[field] && touched[field]) {
      return `${baseClass} border-red-400 focus:ring-red-400 bg-red-50/30`;
    }
    if (touched[field] && !errors[field] && form[field]) {
      return `${baseClass} border-matcha-300 focus:ring-matcha-500 bg-matcha-50/30`;
    }
    return `${baseClass} border-tea-200 focus:ring-matcha-500`;
  };

  const renderFieldStatus = (field: keyof ContactForm) => {
    if (!touched[field] || !form[field]) return null;
    if (errors[field]) {
      return <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />;
    }
    return <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-matcha-600" />;
  };

  const renderError = (field: keyof ContactForm) => {
    if (!errors[field] || !touched[field]) return null;
    return (
      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </p>
    );
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-16 md:py-20 bg-tea-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img
            src="https://images.pexels.com/photos/31751885/pexels-photo-31751885.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=600&w=1920"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-matcha-400 uppercase tracking-[0.3em] text-sm font-medium mb-4">
            Get in Touch
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
            Contact Us
          </h1>
          <p className="text-tea-200/70 text-lg max-w-xl mx-auto">
            We'd love to hear from you. Drop by, call, or send us a message.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ref}
            className={`grid lg:grid-cols-2 gap-12 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Info */}
            <div>
              <h2 className="font-display text-3xl font-bold text-tea-900 mb-8">
                Visit <span className="text-matcha-600">Serene Leaf</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                {info.map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-10 h-10 rounded-lg bg-matcha-50 flex items-center justify-center mb-3">
                      <item.icon className="w-5 h-5 text-matcha-600" />
                    </div>
                    <h3 className="font-display font-semibold text-tea-900 mb-1">
                      {item.title}
                    </h3>
                    {item.lines.map((line) => (
                      <p key={line} className="text-tea-600 text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="relative bg-tea-200 rounded-2xl overflow-hidden h-64 shadow-inner">
                <img
                  src="https://images.pexels.com/photos/31751885/pexels-photo-31751885.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=800"
                  alt="Our tea house"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-tea-900/60 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">
                      142 Willow Creek Lane, Portland, OR
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
              <h3 className="font-display text-2xl font-bold text-tea-900 mb-2">
                Send a Message
              </h3>
              <p className="text-tea-500 mb-8">
                We'll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">✉️</div>
                  <h4 className="font-display text-xl font-semibold text-tea-900 mb-2">
                    Message Sent!
                  </h4>
                  <p className="text-tea-600">
                    Thank you for reaching out. We'll respond soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-tea-700 mb-1.5">
                        Name *
                      </label>
                      <div className="relative">
                        <input
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="John Doe"
                          maxLength={50}
                          className={getInputClass('name')}
                        />
                        {renderFieldStatus('name')}
                      </div>
                      {renderError('name')}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-tea-700 mb-1.5">
                        Phone * <span className="text-tea-400 text-xs">(10 digits)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tea-500 text-sm font-medium">
                          +91
                        </span>
                        <input
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          value={form.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="9876543210"
                          maxLength={10}
                          className={`${getInputClass('phone')} pl-12`}
                        />
                        {renderFieldStatus('phone')}
                      </div>
                      {renderError('phone')}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-tea-700 mb-1.5">
                      Email *
                    </label>
                    <div className="relative">
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="name@example.com"
                        className={getInputClass('email')}
                      />
                      {renderFieldStatus('email')}
                    </div>
                    {renderError('email')}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-tea-700 mb-1.5">
                      Subject <span className="text-tea-400 text-xs">(optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="What's this about?"
                        maxLength={100}
                        className={getInputClass('subject')}
                      />
                      {renderFieldStatus('subject')}
                    </div>
                    {renderError('subject')}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-tea-700 mb-1.5">
                      Message * <span className="text-tea-400 text-xs">
                        ({form.message.length}/1000)
                      </span>
                    </label>
                    <div className="relative">
                      <textarea
                        name="message"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Tell us how we can help you..."
                        maxLength={1000}
                        className={`${getInputClass('message')} resize-none`}
                      />
                    </div>
                    {renderError('message')}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-matcha-600 text-white font-medium rounded-xl hover:bg-matcha-700 transition-all shadow-lg shadow-matcha-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}