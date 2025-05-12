import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faPaperPlane,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import "../styles/css/ContactPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Vui lòng nhập tiêu đề";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Simulate form submission
    console.log("Form submitted:", formData);
    setSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      setSubmitted(false);
    }, 5000);
  };

  const contactInfo = [
    {
      icon: faMapMarkerAlt,
      title: "Địa chỉ",
      content: ["123 Đường ABC, Quận 1", "TP. Hồ Chí Minh, Việt Nam"]
    },
    {
      icon: faPhone,
      title: "Điện thoại",
      content: ["(+84) 28 1234 5678", "(+84) 987 654 321"]
    },
    {
      icon: faEnvelope,
      title: "Email",
      content: ["info@example.com", "support@example.com"]
    },
    {
      icon: faClock,
      title: "Giờ làm việc",
      content: ["Thứ 2 - Thứ 6: 9h - 18h", "Thứ 7: 9h - 16h (Chủ nhật nghỉ)"]
    }
  ];

  const faqs = [
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer: "Thời gian giao hàng thông thường từ 2-5 ngày làm việc tùy thuộc vào khu vực của bạn. Đối với khu vực nội thành, thời gian giao hàng có thể nhanh hơn (1-2 ngày)."
    },
    {
      question: "Làm thế nào để theo dõi đơn hàng?",
      answer: "Bạn có thể theo dõi đơn hàng bằng cách đăng nhập vào tài khoản và kiểm tra phần Lịch sử đơn hàng. Chúng tôi cũng sẽ gửi email và tin nhắn cập nhật trạng thái đơn hàng."
    },
    {
      question: "Chính sách đổi trả hàng như thế nào?",
      answer: "Chúng tôi chấp nhận đổi trả trong vòng 30 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa qua sử dụng và còn đầy đủ nhãn mác, bao bì."
    },
    {
      question: "Có hỗ trợ thanh toán trả góp không?",
      answer: "Có, chúng tôi hỗ trợ thanh toán trả góp 0% lãi suất cho các đơn hàng từ 3 triệu đồng thông qua các đối tác ngân hàng và công ty tài chính."
    }
  ];

  return (
    <div className="contact-page">
      {/* Banner */}
      <section className="contact-banner">
        <div className="contact-banner-content">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </section>

      {/* Thông tin liên hệ & Form */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-info">
            <h2>Thông tin liên hệ</h2>
            <p className="info-intro">
              Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào, hãy liên hệ với chúng tôi qua các kênh dưới đây.
              Đội ngũ hỗ trợ của chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
            
            <div className="info-cards">
              {contactInfo.map((info, index) => (
                <div className="info-card" key={index}>
                  <div className="info-icon">
                    <FontAwesomeIcon icon={info.icon} />
                  </div>
                  <div className="info-content">
                    <h3>{info.title}</h3>
                    {info.content.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="social-links">
              <h3>Theo dõi chúng tôi</h3>
              <div className="social-icons">
                <a href="#" className="social-icon facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="social-icon instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="social-icon twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="social-icon youtube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            
            {submitted ? (
              <div className="success-message">
                <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
                <h3>Cảm ơn bạn đã liên hệ!</h3>
                <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Họ tên <span className="required">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={errors.name ? "error" : ""}
                    />
                    {errors.name && <div className="error-message">{errors.name}</div>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Tiêu đề <span className="required">*</span></label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={errors.subject ? "error" : ""}
                    />
                    {errors.subject && <div className="error-message">{errors.subject}</div>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Nội dung <span className="required">*</span></label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={errors.message ? "error" : ""}
                  ></textarea>
                  {errors.message && <div className="error-message">{errors.message}</div>}
                </div>
                
                <button type="submit" className="btn-primary">
                  <FontAwesomeIcon icon={faPaperPlane} /> Gửi tin nhắn
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Bản đồ */}
      <section className="contact-map">
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241674197956!2d106.6975014!3d10.7795756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8e37c7%3A0x34563f7b83f1c8d!2sBitexco%20Financial%20Tower!5e0!3m2!1sen!2s!4v1654321234567!5m2!1sen!2s"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Vị trí cửa hàng"
          ></iframe>
        </div>
      </section>

      {/* FAQ */}
      <section className="contact-faq">
        <div className="container">
          <div className="section-header">
            <h2>Câu hỏi thường gặp</h2>
            <p>Một số câu hỏi phổ biến mà khách hàng thường hỏi</p>
          </div>
          
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div className="faq-item" key={index}>
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="contact-cta">
        <div className="container">
          <h2>Bạn vẫn còn thắc mắc?</h2>
          <p>Hãy gọi cho chúng tôi theo số hotline hoặc ghé thăm cửa hàng gần nhất</p>
          <div className="cta-buttons">
            <a href="tel:+84987654321" className="btn-primary">Gọi ngay: (+84) 987 654 321</a>
            <a href="#" className="btn-outline">Tìm cửa hàng</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage; 