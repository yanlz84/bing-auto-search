// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.260
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["“上海精神”照亮上合壮大之路", "官方：支持老旧住房自主更新", "“是鹊桥吗” 杭州上空一幕看呆网友", "北京将升挂23万面国旗红旗", "反诈老陈打假嘎子哥翻车后道歉", "男子每天从张家口坐高铁去北京上班", "这种插线板早已被禁用 赶紧扔掉", "5岁半小狗捡瓶5年攒下万元存款", "良品铺子就“花生上树”致歉", "气象局回应哈尔滨上空现不明飞行物", "陈奕迅方就争议言论致歉", "武汉警方：双胞胎学生跳楼系谣言", "中国足协重罚“女足赛场冲突”", "中国电力充足 还需要节约用电吗", "吴京出品电影上映6天票房仅26.7万", "一架F-16战机在波兰坠毁 飞行员遇难", "女子为爱辞职远嫁北京18年后被离婚", "多家银行宣布下调人民币存款利率", "卢卡申科：我要带土豆去中国", "造谣韩磊出轨事件当事人道歉", "妈妈回应2岁萌娃自拍视频海外爆火", "胡歌老婆黄曦宁官宣二胎是儿子", "滴滴支付7.4亿美元和解集体诉讼", "军迷违规拍阅兵军机训练被举报", "男子用面粉给妻子做了一束鲜花", "清华博士勇闯短剧圈 一天拍20小时", "退休外科医生做饭切肉宛如做手术", "12岁女孩半年狂花9万 妈妈急得报警", "迷你LABUBU开售后卖爆 多平台已售罄", "北溪爆炸所有嫌疑人身份曝光", "中方回应九三阅兵嘉宾无西方主要国家", "波司登将收购加拿大鹅？公司回应", "中方回应一些国家不愿出席九三阅兵", "锦州机器人烧烤惊艳葛珊珊", "家长建议禁止学生携带电话手表上学", "七夕带动“浪漫经济” 餐厅一桌难求", "寒武纪发公告：预计全年营收50至70亿", "专家：司法解释并非“全民强制保险”", "这所学校校服免费领", "两架无人机高空相撞 涉事飞手均被罚", "虞书欣父亲起诉老潘财商", "英法德：对伊快速恢复制裁进入倒计时", "IG零封BLG", "乌克兰基辅遭空袭 已致22人死亡", "欧盟：将把乌克兰变成“钢铁豪猪”", "中国科学家在6G通信领域取得新突破", "厦航飞机客舱充电宝疑起火 多方回应", "107岁抗战老兵：曾徒手掰断日军刺刀", "中国完成高校20%学科专业调整", "重大职务犯罪嫌疑人梁小菲被遣返回国", "泽连斯基：将在联大期间组织重要活动"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
