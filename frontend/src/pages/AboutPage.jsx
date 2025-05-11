import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faUsers,
  faStore,
  faTruck,
  faHandHoldingHeart,
  faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/css/AboutPage.css";

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Lưu Trọng Tấn",
      role: "Giám đốc",
      image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      bio: "Người sáng lập và là nhà phát triển chính của thương hiệu"
    },
    {
      name: "Nguyễn Linh Sơn",
      role: "Nhà thiết kế",
      image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      bio: "Chuyên gia thiết kế với nhiều ý tưởng sáng tạo"
    },
    {
      name: "Nguyễn Trung Sơn",
      role: "Quản lý Marketing",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      bio: "Phụ trách chiến lược marketing và phát triển thương hiệu"
    },
    {
      name: "Trần Thanh Anh Tài",
      role: "Quản lý Sản phẩm",
      image: "https://images.unsplash.com/photo-1614644147724-2d4785d69962?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80",
      bio: "Chịu trách nhiệm phát triển sản phẩm và đảm bảo chất lượng"
    }
  ];

  const values = [
    {
      icon: faHandHoldingHeart,
      title: "Chất lượng",
      description: "Chúng tôi đảm bảo mang đến những sản phẩm có chất lượng tốt nhất cho khách hàng"
    },
    {
      icon: faUsers,
      title: "Khách hàng",
      description: "Đặt khách hàng là trung tâm trong mọi quyết định kinh doanh của chúng tôi"
    },
    {
      icon: faLeaf,
      title: "Bền vững",
      description: "Cam kết với các giá trị bền vững và thân thiện với môi trường"
    }
  ];

  const milestones = [
    {
      year: "2025",
      title: "Thành lập công ty",
      description: "Cửa hàng đầu tiên được mở tại Hà Nội"
    },
    {
      year: "2026",
      title: "Mở rộng kinh doanh",
      description: "Mở thêm chi nhánh tại TP.HCM và ra mắt website bán hàng trực tuyến"
    },
    {
      year: "2027",
      title: "Đổi mới công nghệ",
      description: "Áp dụng công nghệ vào quản lý bán hàng và trải nghiệm khách hàng"
    },
    {
      year: "2028",
      title: "Phát triển bền vững",
      description: "Đưa các sản phẩm thân thiện với môi trường vào danh mục sản phẩm"
    }
  ];

  return (
    <div className="about-page">
      {/* Banner */}
      <section className="about-banner">
        <div className="about-banner-content">
          <h1>Về chúng tôi</h1>
          <p>Khám phá câu chuyện, tầm nhìn và những giá trị cốt lõi của chúng tôi</p>
        </div>
      </section>

      {/* Giới thiệu */}
      <section className="about-intro">
        <div className="container">
          <div className="intro-content">
            <h2>Câu chuyện của chúng tôi</h2>
            <p>
              Được thành lập vào năm 2025, chúng tôi là thương hiệu thời trang Việt Nam đầy tiềm năng do bốn thành viên trẻ Lưu Trọng Tấn, Nguyễn Linh Sơn, Nguyễn Trung Sơn và Trần Thanh Anh Tài sáng lập. Chúng tôi tin rằng thời trang không chỉ là về quần áo, mà còn là cách để mọi người thể hiện cá tính và phong cách sống của mình.
            </p>
            <p>
              Với sứ mệnh mang đến những sản phẩm thời trang chất lượng cao với giá cả hợp lý, chúng tôi không ngừng cải tiến và phát triển để đáp ứng nhu cầu ngày càng cao của khách hàng.
            </p>
          </div>
          <div className="intro-image">
            <img src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt="Cửa hàng của chúng tôi" />
          </div>
        </div>
      </section>

      {/* Số liệu thống kê */}
      <section className="about-stats">
        <div className="container">
          <div className="stat-item">
            <div className="stat-number">5+</div>
            <div className="stat-label">Năm kinh nghiệm</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Cửa hàng trên toàn quốc</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50k+</div>
            <div className="stat-label">Khách hàng hài lòng</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5k+</div>
            <div className="stat-label">Sản phẩm</div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="about-values">
        <div className="container">
          <div className="section-header">
            <h2>Giá trị cốt lõi</h2>
            <p>Những nguyên tắc định hướng mọi hoạt động của chúng tôi</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div className="value-card" key={index}>
                <div className="value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cột mốc phát triển */}
      <section className="about-milestones">
        <div className="container">
          <div className="section-header">
            <h2>Cột mốc phát triển</h2>
            <p>Hành trình phát triển của chúng tôi qua các năm</p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Đội ngũ */}
      <section className="about-team">
        <div className="container">
          <div className="section-header">
            <h2>Đội ngũ của chúng tôi</h2>
            <p>Những người tài năng đứng sau thành công của thương hiệu</p>
          </div>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <div className="member-role">{member.role}</div>
                  <p>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <h2>Trở thành một phần của câu chuyện</h2>
          <p>Khám phá bộ sưu tập của chúng tôi và tìm kiếm phong cách của riêng bạn</p>
          <div className="cta-buttons">
            <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
            <Link to="/contact" className="btn-outline">Liên hệ với chúng tôi</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 