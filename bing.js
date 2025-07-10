// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.161
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
var default_search_words = ["实业兴国 实干兴邦", "女子拒绝1人干3人的活被辞 法院判了", "养老金调整向中低收入群体倾斜", "强台风来袭 该如何防范", "收入200万 清北高才涌入香港保险业", "山东德州通报在押人员死亡：未遭殴打", "尹锡悦囚室无空调 第一天菜单曝光", "比亚迪为智能泊车安全兜底", "上海海关学院录取位次超上海交大", "没考上985被父母赶出家到底是谁的错", "杨少华生前剪彩餐馆被恶意打差评", "医保个人账户将全部取消？假", "退休人员基本养老金总体上调2%", "马斯克发布Grok4大模型号称世界最强", "男子借款20万还款2800万仍欠470万", "外交部回应乌方称拘留2名中国公民", "儿媳回应杨少华去世争议", "网红律师西绿已被刑拘", "男子理发店充430万 灌肠一疗程30万", "中国马来西亚互免签证协定即将生效", "也门胡塞武装公布击沉第二艘船过程", "郭德纲发文悼念杨少华：一路走好", "杨颖带小海绵参加巴黎时装周", "中方向以色列提出严正交涉", "特朗普：韩国应交100亿美元保护费", "外交部回应特朗普加征50%铜关税", "演员吴越逛昆明菜市场", "妈妈谈吴艳妮刚上大学时曾被孤立", "乌克兰一官员在基辅遭近距离枪杀", "男子担心迟到三巴掌抽掉电梯门获刑", "律师称因狐臭辞退员工属就业歧视", "避暑这一块还得是云南啊", "干部出轨他人妻子此前为何不处理", "暴雨致重庆一小区女保安遇难", "胡塞公布击沉“永恒C”号货轮视频", "特朗普再对8国加征关税 最高50%", "《以法之名》李人俊自首坦白", "浙江62岁女富豪自首 家人已入外籍", "三胞胎宝爸买冬瓜给孩子解暑降温", "杨少华葬礼安排公布", "女子称因狐臭遭同事投诉被公司辞退", "车主脑洞大开贴透明车衣养鱼", "特朗普：请总统自我介绍报出国名", "父亲欠下百万 希望女儿帮忙还债", "也门胡塞武装在红海击沉第二艘货轮", "张本智和晋级美国大满贯男单16强", "被充值430万的理发店负责人称将辟谣", "多地明确女性劳动者可休痛经假", "商务部：打击战略矿产走私出口", "马思纯瘦回黎吧啦 状态回春", "公职人员被色诱拍私密照 叛国窃密"]

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
