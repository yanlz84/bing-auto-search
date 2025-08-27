// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.257
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
var default_search_words = ["从习主席引用的古语读懂上合力量", "地底也有大量生命存在 能以地震为食", "外交部回应李在明涉华言论", "受阅官兵劈枪训练有多帅", "揭秘峨眉山陪爬团队：九成游客为女性", "中国第一个“三机场”城市来了", "网警守护开学季", "61岁演员林雪片场求职", "13岁男孩患8种绝症写信求妈妈弃疗", "七夕来临 “牛郎织女”竟渐行渐远", "22岁女村支书遇车祸身亡 上任仅数月", "山东一幼儿园用胶带封孩子嘴？假", "歌手韩磊回应被曝致女生怀孕：已报警", "iPhone 17全系价格曝光", "杭州地铁两女子疑因行乞嫌少发飙", "杨靖宇将军牺牲确切时间地点确认", "故宫再现“龙吐水”盛景", "喝冰可乐治偏头痛？医生揭秘真相", "女子被原配追回转账故意发侮辱金额", "何穗清空社交平台疑似退圈", "失业的内娱明星正批量下海拍短剧", "女子买旗袍怀疑买到寿衣", "辛巴刚宣布退网 辛选就传出裁员", "员工查出血管瘤要求不上夜班遭解雇", "中方回应特朗普欢迎中国留学生赴美", "江西一三甲医院突发火灾 官方通报", "深圳欢乐谷被指擦边表演已叫停", "这届年轻人正在重构“婚恋度量衡”", "男子称与发妻八字不合5次起诉离婚", "律师解读高速戴恐怖面具吓人行为", "合肥发现最大蝗虫 专家称可做美食", "清华高颜值跳高冠军力挺吴艳妮化妆", "美团将于年底全面取消超时扣款", "3亿元始祖鸟造假案19名主犯被判刑", "男生宿舍一间住42人？高校回应", "《浪浪山小妖怪》导演人民日报撰文", "重庆18岁准大学生每天送外卖10小时", "特朗普为何表态不再直接资助乌克兰", "官方通报三亚高空坠物致1死2伤", "中方代表预判美方代表的发言", "兰州牛肉拉面加速迈上标准化新征程", "老人捅马蜂窝被蜇瞒着家人险丧命", "高校干部酒后不幸去世 校方回应", "中方回应“美希望中国削减核武库”", "深圳首条L4级自动驾驶公交专线开通", "发的馒头被质疑不卫生？川航回应", "大爷好心救助眼镜蛇反被咬伤", "特郎普拟将国防部改战争部有何深意", "斯瓦泰克恭喜泰勒斯威夫特订婚", "高考生占6成 浙大公布新生大数据", "62岁李连杰机场被偶遇疑复工"]

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
