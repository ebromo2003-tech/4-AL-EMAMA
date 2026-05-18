/**
 * 🎯 وظائف تفاعلية لدرس الإمامة
 * متوافق مع المتصفحات الحديثة - لا يعتمد على مكتبات خارجية
 */

// ========================================
// 📊 تتبع التقدم في الدرس
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  updateProgressBar();
  setupNavigation();
  setupDragAndDrop();
  loadSavedReflections();
});

function updateProgressBar() {
  const progressBar = document.getElementById('progressBar');
  const units = document.querySelectorAll('.unit');
  const totalUnits = units.length;
  
  let completedUnits = 0;
  units.forEach(unit => {
    // يعتبر الوحدة مكتملة إذا كان فيها أي تفاعل تم
    if (unit.querySelector('.save-status')?.textContent.includes('✓') ||
        unit.querySelector('.feedback.success')) {
      completedUnits++;
    }
  });
  
  const progress = Math.min(100, Math.round((completedUnits / totalUnits) * 100));
  progressBar.style.width = `${progress}%`;
}

// ========================================
// 🧭 التنقل بين الوحدات
// ========================================
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const units = document.querySelectorAll('.unit');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // تحديث الحالة النشطة في القائمة
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // إظهار الوحدة المطلوبة
      const targetId = link.getAttribute('href').substring(1);
      units.forEach(unit => {
        unit.classList.remove('active');
        if (unit.id === targetId) {
          unit.classList.add('active');
          // التمرير السلس للوحدة
          unit.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      
      // تحديث شريط التقدم
      updateProgressBar();
    });
  });
  
  // تحديث القائمة عند التمرير
  window.addEventListener('scroll', () => {
    let currentUnit = '';
    units.forEach(unit => {
      const rect = unit.getBoundingClientRect();
      if (rect.top <= 150 && rect.bottom >= 150) {
        currentUnit = unit.id;
      }
    });
    
    if (currentUnit) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-unit') === currentUnit || 
            (currentUnit === 'quiz' && link.getAttribute('data-unit') === 'quiz')) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ========================================
// 📜 توسيع/طي قصص الدرس
// ========================================
function toggleStory(header) {
  const body = header.nextElementSibling;
  const icon = header.querySelector('.toggle-icon');
  
  body.classList.toggle('expanded');
  header.classList.toggle('collapsed');
  
  // حفظ حالة التوسيع في الذاكرة المحلية
  const storyId = header.querySelector('h3').textContent;
  if (body.classList.contains('expanded')) {
    localStorage.setItem(`story_${storyId}`, 'expanded');
  } else {
    localStorage.removeItem(`story_${storyId}`);
  }
}

// استعادة حالة القصص عند التحميل
document.querySelectorAll('.story-header').forEach(header => {
  const storyId = header.querySelector('h3').textContent;
  if (localStorage.getItem(`story_${storyId}`) === 'expanded') {
    toggleStory(header);
  }
});

// ========================================
// 💾 حفظ الإجابات التأمليّة
// ========================================
function saveReflection(num) {
  const input = document.getElementById(`reflection${num}`);
  const status = document.getElementById(`status${num}`);
  const value = input.value.trim();
  
  if (value) {
    localStorage.setItem(`reflection_${num}`, value);
    status.textContent = '✓ تم الحفظ محلياً';
    status.className = 'save-status success';
    updateProgressBar();
  } else {
    status.textContent = '⚠️ اكتب إجابة أولاً';
    status.className = 'save-status error';
  }
}

function loadSavedReflections() {
  for (let i = 1; i <= 5; i++) {
    const saved = localStorage.getItem(`reflection_${i}`);
    const input = document.getElementById(`reflection${i}`);
    if (saved && input) {
      input.value = saved;
    }
  }
}

// ========================================
// 🧩 نشاط الترتيب (سحب وإفلات مبسط)
// ========================================
function setupDragAndDrop() {
  const draggables = document.querySelectorAll('.draggable');
  const container = document.getElementById('dragContainer');
  
  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', () => {
      draggable.classList.add('dragging');
    });
    
    draggable.addEventListener('dragend', () => {
      draggable.classList.remove('dragging');
    });
  });
  
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const dragging = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(container, e.clientY);
    
    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function checkOrder() {
  const items = document.querySelectorAll('.draggable');
  const correctOrder = ['النص القرآني والنبوي', 'الإجماع', 'الرأي البشري'];
  const userOrder = Array.from(items).map(item => item.textContent);
  
  const feedback = document.getElementById('orderFeedback');
  
  if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
    feedback.textContent = '✅ ممتاز! الترتيب صحيح وفق المنهج الأصولي.';
    feedback.className = 'feedback success';
    updateProgressBar();
  } else {
    feedback.textContent = '💡 حاول مرة أخرى: ابدأ بالنص الإلهي ثم الإجماع ثم الرأي.';
    feedback.className = 'feedback error';
  }
}

// ========================================
// 🎭 التحقق من السيناريو التطبيقي
// ========================================
function checkScenario() {
  const selected = document.querySelector('input[name="scenario"]:checked');
  const feedback = document.getElementById('scenarioFeedback');
  
  if (!selected) {
    feedback.textContent = '⚠️ اختر إجابة أولاً';
    feedback.className = 'feedback error';
    return;
  }
  
  if (selected.value === 'correct') {
    feedback.textContent = '✅ صحيح! في الفروع يجب الرجوع للمرجع الأعلم.';
    feedback.className = 'feedback success';
    updateProgressBar();
  } else {
    feedback.textContent = '❌ غير دقيق. تذكر: الفروع تحتاج تقليد الأعلم، لا بحثاً فردياً.';
    feedback.className = 'feedback error';
  }
}

// ========================================
// 📚 المصطلحات التفاعلية (النوافذ المنبثقة)
// ========================================
const definitions = {
  linguistic: {
    title: 'الإمامة في اللغة',
    text: 'هي الرئاسة والقيادة، والإمام هو الشخص الذي يؤتمّ به ويُقتدى به ويكون في المقدمة، سواء كان في الخير أو في الشر. من الجذر (أ-م-م) الدال على القصد والائتمام.'
  },
  terminology: {
    title: 'الإمامة في الاصطلاح الشيعي',
    text: '«رئاسة عامة في أمور الدين والدنيا خلافةً عن صاحب الشريعة». وهي منصب إلهي لعصمة الشريعة، وبيان مجملها، وحفظها من التحريف، مع وجوب الطاعة المطلقة في حدود الشرع.'
  },
  boundary: {
    title: 'حدود الوحي والتشريع',
    text: 'الوحي التشريعي (التكليف الجديد) انقطع بوفاة النبي (ص). أما تنزّل الملائكة على الإمام فهو للإلهام، أو الإخبار بالوقائع، أو التأييد - دون تشريع جديد. الإمام حافظ ومبيّن، لا مشرّع.'
  }
};

function showDefinition(key) {
  const modal = document.getElementById('definitionModal');
  const title = document.getElementById('modalTitle');
  const text = document.getElementById('modalText');
  
  if (definitions[key]) {
    title.textContent = definitions[key].title;
    text.textContent = definitions[key].text;
    modal.classList.add('active');
  }
}

function closeModal() {
  document.getElementById('definitionModal').classList.remove('active');
}

// إغلاق النافذة بالنقر خارج المحتوى
document.getElementById('definitionModal').addEventListener('click', (e) => {
  if (e.target.id === 'definitionModal') {
    closeModal();
  }
});

// إغلاق النافذة بمفتاح Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// ========================================
// 🧠 الخريطة الذهنية التفاعلية
// ========================================
function expandNode(nodeId) {
  const sub = document.getElementById(`${nodeId}-sub`);
  if (sub) {
    sub.classList.toggle('active');
    const hint = sub.previousElementSibling.querySelector('.expand-hint');
    hint.textContent = sub.classList.contains('active') ? '−' : '+';
  }
}

// ========================================
// ✍️ نشاط أكمل المسار
// ========================================
function checkBlanks() {
  const blank1 = document.getElementById('blank1').value.trim();
  const blank2 = document.getElementById('blank2').value.trim();
  const feedback = document.getElementById('blankFeedback');
  
  // كلمات مفتاحية مقبولة للإجابة
  const valid1 = ['خاتمة', 'نهائية', 'كاملة', 'تامة'];
  const valid2 = ['إمام', 'إمام معصوم', 'حجة', 'وصي', 'خليفة'];
  
  const isBlank1Correct = valid1.some(word => blank1.includes(word));
  const isBlank2Correct = valid2.some(word => blank2.includes(word));
  
  if (isBlank1Correct && isBlank2Correct) {
    feedback.textContent = '✅ ممتاز! فهمت العلاقة العقلية بين خاتمية النبوة ووجوب الإمامة.';
    feedback.className = 'feedback success';
    updateProgressBar();
  } else {
    feedback.textContent = '💡 تلميح: الشريعة "خاتمة"، فيجب وجود "إمام معصوم" لحمايتها.';
    feedback.className = 'feedback error';
  }
}

// ========================================
// ✅ نظام الاختبار النهائي
// ========================================
function submitQuiz() {
  let score = 0;
  
  // سؤال 1: اختيار واحد
  const q1 = document.querySelector('input[name="q1"]:checked');
  if (q1 && q1.value === 'correct') score += 3;
  
  // سؤال 2: اختيار متعدد
  const q2 = document.querySelectorAll('input[name="q2"]:checked');
  let q2Correct = 0;
  q2.forEach(input => {
    if (input.value === 'correct') q2Correct++;
    if (input.value === 'wrong') q2Correct--; // خصم للإجابات الخاطئة
  });
  score += Math.max(0, q2Correct * 1.5); // بحد أقصى 3 نقاط
  
  // سؤال 3: إجابة نصية (تقييم تلقائي مبسط)
  const q3 = document.querySelector('textarea[name="q3"]').value.trim();
  const keywords = ['تشريع', 'جديد', 'انقطع', 'معصوم', 'بيان', 'حفظ'];
  const hasKeywords = keywords.some(kw => q3.includes(kw));
  if (q3.length > 20 && hasKeywords) score += 4;
  
  // عرض النتيجة
  const resultDiv = document.getElementById('quizResult');
  const scoreSpan = document.getElementById('score');
  const message = document.getElementById('resultMessage');
  
  score = Math.round(Math.min(10, score));
  scoreSpan.textContent = score;
  
  if (score >= 8) {
    message.textContent = '🌟 ممتاز! لديك فهم عميق لمبحث الإمامة. بارك الله فيك.';
    message.style.color = 'var(--color-success)';
  } else if (score >= 5) {
    message.textContent = '👍 جيد! راجع النقاط التي تحتاج توضيحاً لزيادة ترسيخ المعلومة.';
    message.style.color = 'var(--color-warning)';
  } else {
    message.textContent = '📚 نوصي بإعادة دراسة الدرس، فالإمامة من أصول الدين التي تحتاج يقيناً.';
    message.style.color = 'var(--color-error)';
  }
  
  resultDiv.style.display = 'block';
  resultDiv.scrollIntoView({ behavior: 'smooth' });
  
  // حفظ نتيجة الاختبار
  localStorage.setItem('imamate_quiz_score', score);
  updateProgressBar();
}

// ========================================
// 🔊 محاكاة تشغيل الصوت (يمكن استبداله بملف حقيقي)
// ========================================
function playAudio(id) {
  // في التطبيق الفعلي: استبدل هذا برابط ملف صوتي حقيقي
  // مثال: new Audio('audio/ayah67.mp3').play();
  
  alert('🔊 في النسخة النهائية: سيتم تشغيل تلاوة مجودة للآية.\n\nملاحظة: تأكد من الحصول على تراخيص الاستخدام للملفات الصوتية.');
  
  // تأثير بصري بديل
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '▶️ جاري التشغيل...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 2000);
}

// ========================================
// 🎨 تأثيرات إضافية عند التحميل
// ========================================
window.addEventListener('load', () => {
  // تأثير ظهور تدريجي للعناصر
  document.querySelectorAll('.story-card, .evidence-card, .comparison-table').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 * i);
  });
});