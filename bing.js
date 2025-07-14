// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.168
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
var default_search_words = ["习近平回信电影艺术家引发热烈反响", "村民不满古镇收门票 指引游客逃票", "9.9包邮手机壳铅含量超标30倍", "月球上修路盖房子 可以就地取材？", "泽连斯基已确认乌新总理人选", "娃哈哈回应宗馥莉因遗产被起诉", "受处分女生不必被拉出来“游街”", "翻8吨垃圾找儿童手表被质疑浪费人力", "特朗普为切尔西颁奖硬站C位 球员愣住", "侃爷上海演唱会主办方致歉", "1岁男孩被女子强搂亲吻后发烧得水痘", "无痛分娩影响孩子智力发育？假", "陈奕迅北京演唱会踩空台阶摔倒", "目击者回应男子心肺复苏被指袭胸", "辛纳夺得温网男单冠军", "切尔西战胜大巴黎 夺得世俱杯冠军", "被女子强搂亲吻男孩妈妈愤怒回应", "白宫：特朗普有权解雇美联储主席", "王毅会见拉夫罗夫 两人都没打领带", "失联高考生电话被自称缅甸人接听", "乌克兰男子Zeus发文道歉", "大巴黎输球后主帅锁喉切尔西球员", "新郎凌晨准备接亲被父亲挂错档撞倒", "帕尔默2射1传荣膺金球奖", "山东一地凌晨数十人蒙眼列队湖边走", "结婚1年离婚40万陪嫁被判为共同财产", "杨议在杨少华去世后首次发声", "林俊杰疑突身体疼痛背对观众拭泪", "网红“张三嫂”儿子确诊ADHD", "扎波罗热核电站附近发生枪击", "女子在洪崖洞强拉游客拍照 被处罚", "Zeus回应女学生被开除：感到很遗憾", "美施压应对“台海战争” 日澳拒表态", "顾客“0元购”爽约 店家倒大量茶饮", "依赖辅助驾驶致1死 检方相对不起诉", "印度女学生疑遭性骚扰 举报未果自焚", "网友称因发黄杨钿甜相关视频被起诉", "加拿大一架波音737客机发动机起火", "台军“汉光”军演事故接二连三", "对话写我的母亲农民工大爷", "中国组合夺温网轮椅网球女双冠军", "中央气象台继续发布高温黄色预警", "以总理指责哈马斯拒绝停火协议", "中国女排获U19世锦赛第六", "李宇春长沙音乐节", "以军F-15战机险些紧急降落伊朗", "苏超休赛赣超开战 江西最没存在感？", "以民众发起大规模抗议示威", "38岁何洁近照曝光", "宫鲁鸣评价张子宇未来路还很长", "高考604分考生为了从军梦考上高职"]

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
