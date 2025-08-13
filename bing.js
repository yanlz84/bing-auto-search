// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.229
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
var default_search_words = ["战略叠加优势 如何变为发展胜势", "淘宝第一个程序员离职 已成亿万富豪", "南极发现一具冰封66年遗骸", "“双贴息”政策落地 如何办理", "李在明就韩国反华集会下达指示", "被耐克起诉后陈冠希发文", "智能家居时代网警守护“家”的安全", "全国多地水域发现“食脑虫”踪迹", "大理失踪的8岁自闭症男童不幸遇难", "13岁男孩野外玩水后看到“小人跳舞”", "活久见！李毅本人首次空降“帝吧”", "景区百米蹦极台坍塌？假", "爷爷演出话筒故障 10岁孙子机智救场", "“杨柳”或成今年登陆中国最强台风", "高校收宿舍空调租金4年要1680元", "美国首次在台湾地区部署巡飞弹", "王宝强读左权致叔父的家信", "女子被赌徒前夫当儿子面杀害", "赵露思回应“助农公司公章造假”", "两困难准大一新生被骗3500元", "中国女子在日本买小岛：想再买一些", "《凡人修仙传》豆瓣开分7.5分", "参加高考的60后大叔被职院录取", "带4名儿童坐高铁到底需要买几张票", "菲律宾前选美皇后被塞车里沉尸海中", "百名袖珍人在“小人国”表演谋生", "市监局介入调查赵露思助农风波", "西班牙高温逼近50℃", "醉驾司机边跑边撒钱：想让你们分神", "赵露思否认借助农带货赚钱", "杨幂《生万物》首演农村女性", "金建希所在看守所每顿餐标约9元", "救援方呼吁市民为失联男童打开蓝牙", "“碳水”选对了吃得饱还不长胖", "韩国歌手权志龙被警方调查", "中方回应是否已要求企业避用H20芯片", "男生被邻居撞成重伤 一年后不治身亡", "王楚钦孙颖莎左手右手的合作", "“我不是史铁生但网友全是余华”", "台风“杨柳”登陆台湾致1人失踪", "女子跳河自杀男友怕担责不报警", "中央气象台发布台风橙色预警", "匈总理：不在谈判桌上就会在菜单里", "22楼坠落男孩重伤 父亲讲述现状", "我拍到了英仙座流星雨", "微信“分付”灰度上线“借款”功能", "馆长深圳行惊呼海上世界太漂亮", "卫健委回应女子称孕7周遭医院误诊", "警车违停被贴罚单 需缴罚款100元", "台风“杨柳”登陆台湾台东", "俄核动力导弹巡洋舰将出海测试"]

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
