// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.205
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
var default_search_words = ["有信心有能力打败一切来犯之敌", "武汉大学：对图书馆性骚扰案全面复核", "人民日报评论：英伟达让我怎么相信你", "中国海军陆战队有多勇？", "俄罗斯为何禁售部分中国品牌卡车", "男子破坏军婚致军人配偶怀孕判刑1年", "净网：网警打击虚假“警情通报”", "快递员儿子放弃北大报考西湖大学", "尹锡悦只穿内衣躺牢房地板上拒捕", "最高法：任何“不缴社保”约定均无效", "女子拒还军人彩礼16万 法院判了", "“只招35岁以上员工”的店营业了", "上海一居民在自家门上涂写“血债”", "14800多名退役军人进入中小学任教", "“如花”扮演者曾因中风致半身瘫痪", "网友喊话李诞给柳岩道歉", "女子穿洛丽塔遭华尔道夫酒店驱赶", "武大将调查复核杨某某学位论文", "中国海洋大学录取通知书疑印错", "女子报警硬刚清晨5点广场舞", "日本高中生：要把历史真相告诉更多人", "女子35楼坠落 救治50余天恢复神志", "细节披露 歼-10C“击落”隐身战机", "外交部：巴拉圭不能做异类背对中国", "“鼠标手”可认定为工伤 今起实施", "湖北退出航母命名争夺战", "女老师婚后遇害 警方掘坟做DNA鉴定", "“抓100个老婆回家”视频博主被罚", "充电宝新国标来了", "内蒙古境内发现《皇帝北巡之碑》", "男子挖到宋元时期宝藏 卖了20万被抓", "吉林一高校通知书能做小鸡炖蘑菇", "21人被终身禁止进入神树坪基地", "国外男子疑捡到失踪中国渔船漂流瓶", "靴子落地 玉溪市委原书记王力被查", "女子喝“祖传秘方”药汤后中毒身亡", "著名流体力学专家周恒逝世", "乌克兰首都基辅遭袭已致31死159伤", "新疆一景区发生山洪已致2人遇难", "八一式马步枪设计者工资比朱德高", "小伙猛炫奶茶血变 “牛奶” 送急诊", "旺仔小乔被榜一大哥起诉", "三甲医院空调外机放大厅内？医院回应", "北京一中学9名新生家长被骗4000余元", "澳大利亚一地现大片条纹状云", "派出所回应男子遭“亮证”逼迫让路", "李梦晒参加军人运动会照片", "日方要求俄方“归还金阁寺模型”", "俄海拔最高城市进入紧急状态", "中国学生在日本遭勒颈抢劫", "台湾同学“听劝”都到大陆来"]

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
