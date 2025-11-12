// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.410
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
var default_search_words = ["习近平总书记海南广东之行纪实", "荒野求生5名选手血钾超标", "歼-16飞行员视距以内与敌机缠斗", "跟着全运会吉祥物打卡世界级湾区", "8人穿“警服”为婚礼开路？后续来了", "日本前首相驳高市早苗：狗越小越会叫", "“地表最难乒乓球赛”强度有多大", "特朗普宣称美国不再资助乌克兰", "13岁小孩姐回应破亚洲纪录夺冠", "“最丑建筑”铜钱大厦拍卖 无人报名", "日本企图插手台湾问题必将自食恶果", "“陕西咸阳千亩辣椒免费摘”不实", "中学书记教学楼屋顶坠亡 教体局回应", "466具琉球人遗骨被日本殖民者偷挖", "台当局恐吓民众别转发大陆要抓沈伯洋", "比孙杨、潘展乐还快！他是谁", "乒乓球男单前8号种子出局一半", "暴走团现身香港 放音乐打扰其他游客", "从7元涨到40元 奶皮子一天一个价", "“民间投资13条”重磅发布", "中方回应两艘中国渔船先后倾覆", "特朗普夸赞沙拉：他是个硬汉", "13岁小孩姐打破尘封13年的亚洲纪录", "农户响应号召种树 成材后被禁止采伐", "“双十一”急诊科来了太多主播", "张又侠：坚决防止做两面人、搞伪忠诚", "英国海边出现巨型“海怪”", "许绍雄女儿再发文 公开告别会细节", "全运会选手倒地庆祝后发现比赛没结束", "警告！渤海部分海域进行实弹射击", "全运会“顶流”表情包来了", "员工半年迟到32次被辞退 法院判了", "95岁巴菲特每周还上5天班", "张子宇出战9分58秒爆砍28分", "盖楼进入“拼乐高”时代", "律师银行取款4万遭盘问：具体买什么", "高雄市议会蓝绿民代爆发激烈冲突", "首次！中国新能源车月销量超燃油车", "保险女销售请假参加荒野求生瘦29斤", "巴基斯坦首都自杀式炸弹袭击致12死", "泰国总理：将不再遵守泰柬和平声明", "俄罗斯禁止30名日本公民入境", "中方回应美暂停出口管制穿透性规则", "印度首都汽车爆炸已致12死", "土耳其坠毁军机残骸已找到", "故宫造办处旧址下有何奥秘", "巴菲特谢幕信称将安静退场", "王文涛：安世半导体问题责任在于荷方", "7省份已率先实现生娃基本不花钱", "美“福特”号航母进入加勒比海地区", "新疆民警记录雪豹狩猎北山羊全过程"]

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
