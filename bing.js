// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.6
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @connect      gumengya.com
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
var pause_time = 9; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词
var appkey = "";//从https://www.gmya.net/api 网站申请的热门词接口APIKEY
var Hot_words_apis = "https://api.gmya.net/Api/";// 故梦热门词API接口网站


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平在马来西亚媒体发表署名文章", "哈尔滨公安悬赏通缉3名美国特工", "33岁男子疑因思念亡妻殉情", "美滥施关税乱上加乱", "敦煌网在美爆火", "外交部回应中方通缉3名美国特工", "反网络霸权 网警在行动", "外交部回应谷歌地图将南海改名", "曹德旺喊话拆“围墙”", "国家安全部推出金猴降妖特别篇", "二手房成交价普遍跌回8年前", "杭州发生恶性刑事案件？系AI编造", "大妈逗黔灵山猴子玩被抓掉假发", "雷军时隔一周多再发文", "美国进口订单开始断崖式暴跌", "厨房水龙头流出马桶水 水务部门回应", "特朗普破防了 中国就是不理他", "做一锅香椿酱留住春天", "SU7坠崖车主发文感谢雷军", "田曦薇像是穿了条丝巾就出门了", "因婆家太好女子把亲妹介绍给小叔子", "男子成年后长高20cm 骨龄仅13到15岁", "林更新与女友年龄差11岁", "被中方通缉的3名美国特工做了什么", "男子分享媳妇做饭 厨房像“打仗”", "越南是唯一一个庆祝猫年的国家", "台媒：大陆用美国招数打美国“七寸”", "《编辑部的故事》牛大姐扮演者去世", "老板悄悄将消防员餐食换成超大份", "汽修厂老板雇车手16次撞豪车骗保", "1家3口被撞案家属：肇事者态度恶劣", "郑恺携家带口录《跑男》", "医生：猝死的年轻人通常有6个共性", "志田千阳：感谢中国主办方加强安保", "重庆有人“放生”矿泉水 当地回应", "三位留学生亲历美国签证被撤销", "叶童被粉丝拽下车", "男子开迈巴赫顿顿吃10多块外卖", "美国有小企业主称可能6个月内破产", "顺风车司机高速上开“智驾”睡觉", "人民网评悬疑剧《沙尘暴》", "吴京说沈腾辈分上是长辈", "106岁八路军女战士耿真逝世", "旅客吐槽高铁站免费插座设3米高", "昆明火灾8名遇难者是一家人", "家具厂女员工拒绝向普京透露工资", "38岁男子住进小儿骨科病房", "23年前的偶像剧男演员撞脸全红婵", "23岁宝妈带娃气出核桃大肿块", "母女4人全确诊 肺癌或有家族遗传性", "消费者对路易威登涨价反应冷淡"]

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
    let randomDelay = Math.floor(Math.random() * 20000) + 10000; // 生成10秒到30秒之间的随机数
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
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            // 检查是否需要暂停
            if ((currentSearchCount + 1) % 5 === 0) {
                setTimeout(function () {
                    location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
                }, pause_time);
            } else {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
