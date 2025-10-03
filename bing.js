// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.331
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
var default_search_words = ["从总书记的话语中感悟深沉的家国情", "北方将现气温大逆转", "叙利亚前总统阿萨德被投毒", "中国完成首次极区载人深潜调查任务", "肯德基保密54年的炸鸡配方将公开", "特警小哥：拍完你的拍你的", "国庆出行 网警送你一份网络安全指南", "知名车评人陈震发生交通事故", "黄蓉来开公交了", "越来越多人喜欢上“搭子”社交", "游本昌演完《繁花》5年没走出来", "雁门关景区辟谣“游客1死2伤”", "#人人人人人人我人人人人人人#", "300万粉丝网红去世 家属欲进行尸检", "庞众望回应女友晒“结婚登记照”", "普京：向“中国兄弟姐妹”致意", "人比沙子多 敦煌鸣沙山被人海淹没", "伊朗总统：伊朗必须迁都", "歼16与外军隐身战机缠斗 详情披露", "胖东来不是景区却胜似景区", "微信“工具人”将被永久限制登录", "鸡排哥终于可以休息了", "炒粉老板开门发现百米长队天塌了", "美籍男子解放军舰队旁放无人机被捕", "于东来面试刑释人员视频曝光", "岳麓山又被游客踩矮了", "95后新人国庆结婚用外卖办酒席", "海口4日下午起将实施“六停”", "浏阳无人机烟花表演失火 观众发声", "“全网最爱发钱的老板”又要发红包", "陕西一新郎婚礼前跳河", "小狗看到有婚车拦路扮演“娘家人”", "航班连换3架飞机未起飞 航司：已赔偿", "鸡排哥回应忙到没有了情绪价值", "男子拿扇子被误认持刀：遭踹倒送警局", "这种碗盛上热油就是“炸弹”", "美禁止他国买俄能源 普京用谚语回应", "一家三口国庆节开2架飞机回老家", "今年国庆档总票房破8亿", "普京：若有人想与俄较量不妨试试", "鸡排哥爆火最大受益者是正新鸡排吗", "1200架无人机在香港上空绘出山东舰", "台风麦德姆预计5日白天登陆中国沿海", "马克龙等被拍到私下调侃特朗普口误", "全国多个景区游客趋于饱和", "俄罗斯计划攻击北约？普京回应", "墨西哥对华发起多起反倾销调查", "游客因闷热求开窗遭网约车司机怒斥", "比利时军事基地上空出现15架无人机", "网约车违规从事定线运输被现场叫停", "孙颖莎逆转击败王艺迪 晋级女单4强"]

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
