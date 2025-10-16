// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.356
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
var default_search_words = ["巾帼华章", "微信朋友圈凉了？回应来了", "马斯克星链成缅甸电诈帮凶？美方调查", "数览大国金融“十四五”答卷", "央视曝多地共享单车骑行中自动锁车", "世界达到第一个气候临界点", "NBA篮网队宣布裁掉曾凡博", "医院“发喜报”庆祝门诊人数创佳绩", "人民日报评大学宿舍成直播秀场", "中方回应英国制裁11家中国实体", "61年前 中国第一颗原子弹爆炸成功", "外地缴杭州社保享退休待遇系谣言", "私挖地下室不出事就没人管现象当止", "101岁奶奶的长寿秘诀就一句话", "男子安放设备偷拍女室友 警方通报", "微信重申不会出朋友圈访客功能", "喜茶外卖页面被吐槽“吓人”", "“巴铁”送美稀土背刺中国？谁在挑拨", "金店老板：金价跌起来像泄洪", "台湾女歌手突然去世 年仅34岁", "小时候语文书上的课文具像化了", "西安“不倒翁小姐姐”正式复出", "新人结婚不收红包 摸一下后返还宾客", "美威胁停买的中国油或为废弃食用油", "美国大豆卖不出去 农场破产创新高", "多地迎剧烈降温！大雪大暴雨来了", "国考报考首日近19万人报名", "男子花近30万自制重卡房车出游", "美股收盘 热门中概股多数收涨", "“首相梦”要破灭？高市早苗道歉", "甘肃一地发现大型金矿 资源量超40吨", "中国制造正在换“芯”", "美国司法部没收近13万枚比特币", "新型人造肌肉可举起4000倍自重物体", "人去世了朋友圈会消失吗？微信回应", "东北“囤秋菜”现场热闹非凡", "孙颖莎救球把球桌都撞移位了", "男子翻进轨道自杀 获救后反索赔百万", "汪峰女友“森林北”否认投资合作", "亚锦赛颁奖 林诗栋闻鲜花差点要吐了", "多品牌“一口价”黄金饰品将再涨价", "国乒男团夺得亚锦赛冠军", "贝克汉姆为买LABUBU从澳门逛到上海", "西班牙多名中国公民遭持械抢劫", "车顶维权案当事人称特斯拉上诉了", "天猫团队赴灵隐寺求江浙沪大降温", "巴基斯坦与阿富汗已实施停火", "欧盟或2027年底前建成“无人机墙”", "苹果宣布推出M5芯片", "日本遭熊袭击死亡人数创新高", "央行将发行2026版熊猫贵金属纪念币"]

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
