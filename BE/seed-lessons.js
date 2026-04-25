const db = require('./src/config/database');

async function seedLessons() {
  const lessons = [
    // Course 1: JavaScript Fundamentals (thêm từ lesson 9)
    { course_id: 1, title: 'Arrays', content: 'Tạo và thao tác mảng với các method: push, pop, shift, unshift, map, filter, reduce, find, forEach.', order: 9 },
    { course_id: 1, title: 'Objects', content: 'Tạo object, truy cập thuộc tính, destructuring, spread operator. Object methods và this keyword.', order: 10 },
    { course_id: 1, title: 'DOM Manipulation', content: 'Truy cập và thay đổi HTML/CSS qua JavaScript. querySelector, addEventListener, createElement, innerHTML.', order: 11 },
    { course_id: 1, title: 'Events and Event Handling', content: 'Các loại event: click, input, submit, keydown. Event bubbling, capturing và event delegation.', order: 12 },
    { course_id: 1, title: 'Promises and Async/Await', content: 'Hiểu về synchronous vs asynchronous. Promise, .then()/.catch(), async/await và Fetch API.', order: 13 },
    { course_id: 1, title: 'ES6+ Modern Features', content: 'Template literals, optional chaining, nullish coalescing, modules (import/export), Map, Set.', order: 14 },
    { course_id: 1, title: 'Error Handling', content: 'try/catch/finally, custom Error classes, xử lý lỗi trong async code.', order: 15 },
    // Course 2: React for Beginners (thêm từ lesson 9)
    { course_id: 2, title: 'Lists and Keys', content: 'Render danh sách với .map(), tầm quan trọng của key prop và cách chọn key phù hợp.', order: 9 },
    { course_id: 2, title: 'Forms in React', content: 'Controlled vs uncontrolled components. Xử lý form input, validation cơ bản và submit form.', order: 10 },
    { course_id: 2, title: 'useContext Hook', content: 'React Context API để chia sẻ state toàn cục. Tạo Context, Provider và useContext hook.', order: 11 },
    { course_id: 2, title: 'useRef and useMemo', content: 'useRef để truy cập DOM và lưu giá trị không trigger re-render. useMemo để tối ưu performance.', order: 12 },
    { course_id: 2, title: 'Custom Hooks', content: 'Tạo custom hooks để tái sử dụng logic. Ví dụ: useFetch, useLocalStorage, useDebounce.', order: 13 },
    { course_id: 2, title: 'React Router v6', content: 'Cấu hình routes, Link, NavLink, useNavigate, useParams và nested routes.', order: 14 },
    { course_id: 2, title: 'Fetching Data with Axios', content: 'Cài đặt Axios, GET/POST/PUT/DELETE requests, interceptors, xử lý loading và error state.', order: 15 },
    { course_id: 2, title: 'State Management với Zustand', content: 'Giới thiệu Zustand, tạo store, actions và sử dụng trong components.', order: 16 },
    { course_id: 2, title: 'Build và Deploy React App', content: 'Build production bundle với Vite, tối ưu bundle size, deploy lên Vercel/Netlify.', order: 17 },
    // Course 3: UI/UX Design Basics (thêm từ lesson 7)
    { course_id: 3, title: 'User Research Methods', content: 'User interviews, surveys, usability testing, card sorting. Thu thập và phân tích insight từ người dùng.', order: 7 },
    { course_id: 3, title: 'Wireframing', content: 'Low-fidelity wireframe là gì, công cụ wireframing (Figma, Balsamiq). Tạo wireframe cho ứng dụng đơn giản.', order: 8 },
    { course_id: 3, title: 'Prototyping với Figma', content: 'Tạo prototype tương tác trong Figma: frames, components, auto layout, prototype connections.', order: 9 },
    { course_id: 3, title: 'Design Systems', content: 'Xây dựng design system: color tokens, typography scale, spacing, component library.', order: 10 },
    { course_id: 3, title: 'Accessibility in Design', content: 'WCAG guidelines, contrast ratio, font size tối thiểu, keyboard navigation và thiết kế inclusive.', order: 11 },
    { course_id: 3, title: 'Handing Off to Developers', content: 'Export assets, viết design spec, sử dụng Figma Dev Mode, giao tiếp hiệu quả với developer.', order: 12 },
    // Course 4: Startup 101 (thêm từ lesson 6)
    { course_id: 4, title: 'Startup Funding Basics', content: 'Bootstrapping, angel investors, venture capital, crowdfunding. Các vòng gọi vốn: pre-seed, seed, Series A/B/C.', order: 6 },
    { course_id: 4, title: 'Building Your Team', content: 'Tìm co-founder, hiring đầu tiên, equity split, culture và xây dựng team hiệu quả giai đoạn đầu.', order: 7 },
    { course_id: 4, title: 'Marketing và Growth Hacking', content: 'Growth hacking, các kênh marketing cho startup: content, SEO, social media, referral. Đo lường CAC và LTV.', order: 8 },
    { course_id: 4, title: 'Financial Planning', content: 'Burn rate, runway, unit economics, P&L cơ bản. Lập kế hoạch tài chính 12 tháng.', order: 9 },
    { course_id: 4, title: 'Pitching to Investors', content: 'Cấu trúc pitch deck 10 slide, storytelling, demo, Q&A. Những lỗi phổ biến khi pitch và cách tránh.', order: 10 },
    // Course 5: Machine Learning cơ bản đến nâng cao (thêm từ lesson 6)
    { course_id: 5, title: 'Supervised Learning', content: 'Phân loại và hồi quy. Thuật toán Linear Regression, Logistic Regression, Decision Tree.', order: 6 },
    { course_id: 5, title: 'Unsupervised Learning', content: 'Clustering với K-Means, DBSCAN. Dimensionality reduction với PCA.', order: 7 },
    { course_id: 5, title: 'Model Evaluation', content: 'Train/test split, cross-validation, confusion matrix, precision, recall, F1-score, ROC-AUC.', order: 8 },
    { course_id: 5, title: 'Neural Networks cơ bản', content: 'Perceptron, multilayer network, activation functions, backpropagation và gradient descent.', order: 9 },
    { course_id: 5, title: 'Deep Learning với TensorFlow/Keras', content: 'Xây dựng và train neural network với Keras. CNN cho image classification, RNN cho sequence data.', order: 10 },
    { course_id: 5, title: 'Natural Language Processing', content: 'Text preprocessing, TF-IDF, word embeddings, sentiment analysis và text classification.', order: 11 },
    { course_id: 5, title: 'ML Project End-to-End', content: 'Thu thập data, EDA, feature engineering, train model, evaluate, deploy với Flask/FastAPI.', order: 12 },
