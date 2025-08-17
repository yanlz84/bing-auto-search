// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.236
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
var default_search_words = ["重温总书记讲述的抗战岁月", "1.2万亿投资西藏后又一超级工程来了", "多家银行回应存取款超5万是否需登记", "80秒重温抗战大捷", "逆转日本 这帮中国姑娘斩获历史首胜", "普京：望以和平方式解决乌克兰危机", "抗战胜利80周年大会第二次演练完成", "全家带孩子毕业旅游2死3伤 父亲发声", "入境旅客把200多枚鹦鹉蛋冲进下水道", "高铁邻座400斤男子致拥挤？12306回应", "李世民扮演者称演员要养家糊口", "四川德阳发生液化气罐车爆炸？假", "曝特朗普支持把顿巴斯地区让给俄", "范曾四段婚姻多个子女 或引继承问题", "宇树机器人“撞人逃逸”火到国外", "人民日报：“全民强制社保”系误读", "向太谈2次从黑社会手上救出梅艳芳", "美俄乌三方有望会晤？普京没提", "每天花30元去“假装上班”的人", "“亚洲最大医院”院长调整", "见完普京 特朗普谈起中国", "逃出电诈园男子靠吃蚯蚓活命", "外卖小哥发现带血枕头报警救人", "警方通报女子合租房厕所发现摄像头", "专家：俄乌冲突将以牺牲乌利益结束", "中国男篮时隔10年再进亚洲杯决赛", "苍山遇难自闭症男童夏令营从未道歉", "官网模特图片被指辱华 Swatch致歉", "人民日报专访迪丽热巴", "小伙4个月手工造出“猫咪地铁站”", "“汉超”开踢 揭幕战吸引4.6万人观赛", "常州队终于进球了", "空军女飞行员实弹射击训练太飒了", "媒体人：中国男篮太热血了", "南海海域发生4.4级地震", "奶茶店天花板掉落致1名店员身亡", "快递“8毛发全国”时代终结了吗", "警惕AI数据污染引发现实风险", "特朗普普京会议后台“有说有笑”", "防空洞成今年最卷的免费避暑地", "降价5000余万 百年老洋房上线二拍", "泡泡玛特和名创优品终究是撞上了", "日本九州岛附近海域发生5.7级地震", "俄美首脑仓促会晤 分歧或难弥合", "苹果又开一店 有“果粉”通宵排队", "赵睿狂飙24分全场最高", "首球首胜 常州1-0绝杀镇江", "医保支付按病种付费后有哪些新变化", "中超第21轮积分榜：前四依然只差3分", "俄外长为何穿“苏联风”卫衣访美", "郑钦文获颁感动中国年度人物"]

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
